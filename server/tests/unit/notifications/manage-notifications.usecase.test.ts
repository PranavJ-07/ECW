import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MarkNotificationReadUseCase,
  DeleteNotificationUseCase,
} from '../../../src/application/notifications/use-cases/manage-notifications.usecase';
import { NotificationNotFoundError } from '../../../src/domain/errors/notification.errors';
import { NotificationPriority, NotificationType } from '../../../src/domain/enums/notification.enum';
import { INotificationRepository } from '../../../src/domain/interfaces/notification.repository.interface';

const sampleNotification = {
  id: 'n1',
  collegeId: 'college1',
  userId: 'user1',
  type: NotificationType.REGISTRATION_CONFIRMED,
  title: 'Registered',
  body: 'You are registered',
  priority: NotificationPriority.NORMAL,
  isRead: false,
  emailSent: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function mockRepo(): INotificationRepository {
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

describe('ManageNotificationsUseCases', () => {
  let repository: INotificationRepository;

  beforeEach(() => {
    repository = mockRepo();
  });

  it('marks notification as read for owner', async () => {
    vi.mocked(repository.findById).mockResolvedValue(sampleNotification);
    vi.mocked(repository.markRead).mockResolvedValue({ ...sampleNotification, isRead: true, readAt: new Date() });

    const useCase = new MarkNotificationReadUseCase(repository);
    const result = await useCase.execute({
      collegeId: 'college1',
      userId: 'user1',
      notificationId: 'n1',
    });

    expect(result.isRead).toBe(true);
  });

  it('rejects mark read when notification belongs to another user', async () => {
    vi.mocked(repository.findById).mockResolvedValue({ ...sampleNotification, userId: 'other' });

    const useCase = new MarkNotificationReadUseCase(repository);

    await expect(
      useCase.execute({ collegeId: 'college1', userId: 'user1', notificationId: 'n1' }),
    ).rejects.toThrow(NotificationNotFoundError);
  });

  it('deletes notification for owner', async () => {
    vi.mocked(repository.findById).mockResolvedValue(sampleNotification);

    const useCase = new DeleteNotificationUseCase(repository);
    await useCase.execute({
      collegeId: 'college1',
      userId: 'user1',
      notificationId: 'n1',
    });

    expect(repository.delete).toHaveBeenCalledWith('college1', 'user1', 'n1');
  });
});
