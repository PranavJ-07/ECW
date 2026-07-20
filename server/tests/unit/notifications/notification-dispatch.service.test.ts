import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationDispatchService } from '../../../src/application/notifications/services/notification-dispatch.service';
import { EmailDeliveryService } from '../../../src/application/notifications/services/email-delivery.service';
import { NotificationPriority, NotificationType } from '../../../src/domain/enums/notification.enum';
import { INotificationRepository } from '../../../src/domain/interfaces/notification.repository.interface';
import { IUserRepository } from '../../../src/domain/interfaces/user.repository.interface';

function mockNotificationRepo(): INotificationRepository {
  return {
    create: vi.fn(),
    createMany: vi.fn(),
    findById: vi.fn(),
    list: vi.fn(),
    getUnreadCount: vi.fn(),
    markRead: vi.fn(),
    markAllRead: vi.fn(),
    delete: vi.fn(),
  };
}

function mockUserRepo(): IUserRepository {
  return {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findByEmailWithPassword: vi.fn(),
    create: vi.fn(),
    updateLoginSuccess: vi.fn(),
    incrementFailedLoginAttempts: vi.fn(),
  };
}

describe('NotificationDispatchService', () => {
  let notificationRepository: INotificationRepository;
  let userRepository: IUserRepository;
  let emailDeliveryService: EmailDeliveryService;
  let service: NotificationDispatchService;

  beforeEach(() => {
    notificationRepository = mockNotificationRepo();
    userRepository = mockUserRepo();
    emailDeliveryService = { send: vi.fn().mockResolvedValue(true), isConfigured: vi.fn() } as unknown as EmailDeliveryService;
    service = new NotificationDispatchService(
      notificationRepository,
      userRepository,
      emailDeliveryService,
    );
  });

  it('creates in-app notification without email by default', async () => {
    vi.mocked(notificationRepository.create).mockResolvedValue({
      id: 'n1',
      collegeId: 'college1',
      userId: 'user1',
      type: NotificationType.SYSTEM,
      title: 'Welcome',
      body: 'Welcome to EthiCraft',
      priority: NotificationPriority.NORMAL,
      isRead: false,
      emailSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.dispatch({
      collegeId: 'college1',
      userId: 'user1',
      type: NotificationType.SYSTEM,
      title: 'Welcome',
      body: 'Welcome to EthiCraft',
    });

    expect(result.title).toBe('Welcome');
    expect(emailDeliveryService.send).not.toHaveBeenCalled();
  });

  it('sends email when requested and user email exists', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue({
      id: 'user1',
      collegeId: 'college1',
      email: 'user@mit.edu',
      firstName: 'Jane',
      lastName: 'Doe',
      roles: ['student' as import('../../../src/domain/enums/user-role.enum').UserRole],
      platformRole: null,
      emailVerified: true,
      isActive: true,
      failedLoginAttempts: 0,
      lockUntil: null,
      lastLoginAt: null,
      passwordChangedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(notificationRepository.create).mockResolvedValue({
      id: 'n1',
      collegeId: 'college1',
      userId: 'user1',
      type: NotificationType.EVENT_CANCELLED,
      title: 'Event cancelled',
      body: 'Your event was cancelled',
      priority: NotificationPriority.HIGH,
      isRead: false,
      emailSent: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await service.dispatch({
      collegeId: 'college1',
      userId: 'user1',
      type: NotificationType.EVENT_CANCELLED,
      title: 'Event cancelled',
      body: 'Your event was cancelled',
      sendEmail: true,
    });

    expect(emailDeliveryService.send).toHaveBeenCalledWith({
      to: 'user@mit.edu',
      subject: 'Event cancelled',
      text: 'Your event was cancelled',
    });
  });
});
