import { ListMyNotificationsUseCase } from '../../../application/notifications/use-cases/list-my-notifications.usecase';
import { GetUnreadCountUseCase } from '../../../application/notifications/use-cases/get-unread-count.usecase';
import {
  MarkNotificationReadUseCase,
  MarkAllNotificationsReadUseCase,
  DeleteNotificationUseCase,
} from '../../../application/notifications/use-cases/manage-notifications.usecase';
import { NotificationDispatchService } from '../../../application/notifications/services/notification-dispatch.service';
import { EmailDeliveryService } from '../../../application/notifications/services/email-delivery.service';
import { notificationRepository } from '../../../infrastructure/database/repositories/notification.repository';
import { userRepository } from '../../../infrastructure/database/repositories/user.repository';
import { NotificationController } from '../controllers/notification.controller';

const emailDeliveryService = new EmailDeliveryService();

export const notificationDispatchService = new NotificationDispatchService(
  notificationRepository,
  userRepository,
  emailDeliveryService,
);

const listMyNotificationsUseCase = new ListMyNotificationsUseCase(notificationRepository);
const getUnreadCountUseCase = new GetUnreadCountUseCase(notificationRepository);
const markNotificationReadUseCase = new MarkNotificationReadUseCase(notificationRepository);
const markAllNotificationsReadUseCase = new MarkAllNotificationsReadUseCase(notificationRepository);
const deleteNotificationUseCase = new DeleteNotificationUseCase(notificationRepository);

export const notificationController = new NotificationController(
  listMyNotificationsUseCase,
  getUnreadCountUseCase,
  markNotificationReadUseCase,
  markAllNotificationsReadUseCase,
  deleteNotificationUseCase,
);
