import { UnreadCount } from '../../../domain/entities/notification.entity';
import { INotificationRepository } from '../../../domain/interfaces/notification.repository.interface';

export interface GetUnreadCountInput {
  collegeId: string;
  userId: string;
}

export class GetUnreadCountUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(input: GetUnreadCountInput): Promise<UnreadCount> {
    return this.notificationRepository.getUnreadCount(input.collegeId, input.userId);
  }
}
