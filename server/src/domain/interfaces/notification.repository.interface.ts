import { Notification, UnreadCount } from '../entities/notification.entity';
import { NotificationPriority, NotificationType } from '../enums/notification.enum';

export interface CreateNotificationData {
  collegeId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  priority?: NotificationPriority;
  data?: Record<string, string>;
  action?: { label: string; href: string };
  emailSent?: boolean;
}

export interface ListNotificationsFilter {
  collegeId: string;
  userId: string;
  isRead?: boolean;
  type?: NotificationType;
  page: number;
  limit: number;
}

export interface PaginatedNotifications {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

export interface INotificationRepository {
  create(data: CreateNotificationData): Promise<Notification>;
  createMany(data: CreateNotificationData[]): Promise<Notification[]>;
  findById(collegeId: string, id: string): Promise<Notification | null>;
  list(filter: ListNotificationsFilter): Promise<PaginatedNotifications>;
  getUnreadCount(collegeId: string, userId: string): Promise<UnreadCount>;
  markRead(collegeId: string, userId: string, id: string): Promise<Notification>;
  markAllRead(collegeId: string, userId: string): Promise<number>;
  delete(collegeId: string, userId: string, id: string): Promise<void>;
}
