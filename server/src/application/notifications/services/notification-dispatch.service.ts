import { Notification } from '../../../domain/entities/notification.entity';
import { NotificationPriority } from '../../../domain/enums/notification.enum';
import {
  CreateNotificationData,
  INotificationRepository,
} from '../../../domain/interfaces/notification.repository.interface';
import { IUserRepository } from '../../../domain/interfaces/user.repository.interface';
import { EmailDeliveryService } from './email-delivery.service';

export interface DispatchNotificationInput extends CreateNotificationData {
  sendEmail?: boolean;
}

/**
 * Creates in-app notifications and optionally delivers them by email.
 * Other modules call this service — users never create notifications directly.
 */
export class NotificationDispatchService {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly userRepository: IUserRepository,
    private readonly emailDeliveryService: EmailDeliveryService,
  ) {}

  async dispatch(input: DispatchNotificationInput): Promise<Notification> {
    let emailSent = false;

    if (input.sendEmail) {
      emailSent = await this.trySendEmail(input.userId, input.title, input.body);
    }

    return this.notificationRepository.create({
      ...input,
      priority: input.priority ?? NotificationPriority.NORMAL,
      emailSent,
    });
  }

  async dispatchMany(
    inputs: DispatchNotificationInput[],
  ): Promise<Notification[]> {
    if (inputs.length === 0) {
      return [];
    }

    const prepared: CreateNotificationData[] = [];

    for (const input of inputs) {
      let emailSent = false;

      if (input.sendEmail) {
        emailSent = await this.trySendEmail(input.userId, input.title, input.body);
      }

      prepared.push({
        ...input,
        priority: input.priority ?? NotificationPriority.NORMAL,
        emailSent,
      });
    }

    return this.notificationRepository.createMany(prepared);
  }

  private async trySendEmail(userId: string, title: string, body: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);

    if (!user?.email) {
      return false;
    }

    return this.emailDeliveryService.send({
      to: user.email,
      subject: title,
      text: body,
    });
  }
}
