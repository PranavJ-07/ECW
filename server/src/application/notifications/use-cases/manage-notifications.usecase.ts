import { NotificationNotFoundError } from '../../../domain/errors/notification.errors';
import { Notification } from '../../../domain/entities/notification.entity';
import { INotificationRepository } from '../../../domain/interfaces/notification.repository.interface';

export interface MarkNotificationReadInput {
  collegeId: string;
  userId: string;
  notificationId: string;
}

export class MarkNotificationReadUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(input: MarkNotificationReadInput): Promise<Notification> {
    const existing = await this.notificationRepository.findById(
      input.collegeId,
      input.notificationId,
    );

    if (!existing || existing.userId !== input.userId) {
      throw new NotificationNotFoundError();
    }

    if (existing.isRead) {
      return existing;
    }

    return this.notificationRepository.markRead(
      input.collegeId,
      input.userId,
      input.notificationId,
    );
  }
}

export interface MarkAllNotificationsReadInput {
  collegeId: string;
  userId: string;
}

export class MarkAllNotificationsReadUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(input: MarkAllNotificationsReadInput): Promise<{ markedCount: number }> {
    const markedCount = await this.notificationRepository.markAllRead(
      input.collegeId,
      input.userId,
    );

    return { markedCount };
  }
}

export interface DeleteNotificationInput {
  collegeId: string;
  userId: string;
  notificationId: string;
}

export class DeleteNotificationUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(input: DeleteNotificationInput): Promise<void> {
    const existing = await this.notificationRepository.findById(
      input.collegeId,
      input.notificationId,
    );

    if (!existing || existing.userId !== input.userId) {
      throw new NotificationNotFoundError();
    }

    await this.notificationRepository.delete(
      input.collegeId,
      input.userId,
      input.notificationId,
    );
  }
}
