import { NotificationPriority, NotificationType } from '../enums/notification.enum';

export interface NotificationAction {
  label: string;
  href: string;
}

export interface Notification {
  id: string;
  collegeId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  priority: NotificationPriority;
  data?: Record<string, string>;
  action?: NotificationAction;
  isRead: boolean;
  readAt?: Date;
  emailSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnreadCount {
  total: number;
}
