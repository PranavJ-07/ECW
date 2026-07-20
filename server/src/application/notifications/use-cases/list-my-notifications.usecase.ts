import { NotificationType } from '../../../domain/enums/notification.enum';
import {
  INotificationRepository,
  PaginatedNotifications,
} from '../../../domain/interfaces/notification.repository.interface';

export interface ListMyNotificationsInput {
  collegeId: string;
  userId: string;
  isRead?: boolean;
  type?: NotificationType;
  page?: number;
  limit?: number;
}

export class ListMyNotificationsUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(input: ListMyNotificationsInput): Promise<PaginatedNotifications> {
    const page = input.page ?? 1;
    const limit = Math.min(input.limit ?? 20, 100);

    return this.notificationRepository.list({
      collegeId: input.collegeId,
      userId: input.userId,
      isRead: input.isRead,
      type: input.type,
      page,
      limit,
    });
  }
}
