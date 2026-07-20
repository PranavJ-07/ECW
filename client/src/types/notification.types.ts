import type { PaginationMeta } from '@/types/pagination.types';

export type NotificationType =
  | 'event_reminder'
  | 'registration_confirmed'
  | 'registration_cancelled'
  | 'event_cancelled'
  | 'certificate_issued'
  | 'membership_approved'
  | 'membership_rejected'
  | 'budget_alert'
  | 'general';

export type NotificationPriority = 'low' | 'normal' | 'high';

export interface Notification {
  id: string;
  collegeId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  priority: NotificationPriority;
  data?: Record<string, string>;
  action?: { label: string; href: string };
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface UnreadCount {
  total: number;
}

export interface ListNotificationsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType;
}

export interface NotificationsMeta extends PaginationMeta {
  unreadCount: number;
}
