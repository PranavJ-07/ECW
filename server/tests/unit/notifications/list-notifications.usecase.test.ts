import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListMyNotificationsUseCase } from '../../../src/application/notifications/use-cases/list-my-notifications.usecase';
import { GetUnreadCountUseCase } from '../../../src/application/notifications/use-cases/get-unread-count.usecase';
import { NotificationPriority, NotificationType } from '../../../src/domain/enums/notification.enum';
import { INotificationRepository } from '../../../src/domain/interfaces/notification.repository.interface';

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

describe('ListMyNotificationsUseCase', () => {
  let repository: INotificationRepository;
  let useCase: ListMyNotificationsUseCase;

  beforeEach(() => {
    repository = mockRepo();
    useCase = new ListMyNotificationsUseCase(repository);
  });

  it('returns paginated notifications for user', async () => {
    vi.mocked(repository.list).mockResolvedValue({
      notifications: [
        {
          id: 'n1',
          collegeId: 'college1',
          userId: 'user1',
          type: NotificationType.CERTIFICATE_ISSUED,
          title: 'Certificate ready',
          body: 'Your certificate is ready',
          priority: NotificationPriority.NORMAL,
          isRead: false,
          emailSent: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
      unreadCount: 1,
    });

    const result = await useCase.execute({
      collegeId: 'college1',
      userId: 'user1',
    });

    expect(result.notifications).toHaveLength(1);
    expect(result.unreadCount).toBe(1);
  });
});

describe('GetUnreadCountUseCase', () => {
  it('returns unread count', async () => {
    const repository = mockRepo();
    vi.mocked(repository.getUnreadCount).mockResolvedValue({ total: 5 });

    const useCase = new GetUnreadCountUseCase(repository);
    const result = await useCase.execute({ collegeId: 'college1', userId: 'user1' });

    expect(result.total).toBe(5);
  });
});
