import { apiClient } from '@/api/axios';
import type { ApiSuccessResponse } from '@/types/api.types';
import type {
  ListNotificationsParams,
  Notification,
  NotificationsMeta,
  UnreadCount,
} from '@/types/notification.types';
import { extractPaginated } from '@/types/pagination.types';

function mePath(collegeSlug: string): string {
  return `/colleges/${collegeSlug}/users/me`;
}

export async function listNotifications(
  collegeSlug: string,
  params?: ListNotificationsParams,
) {
  const { data } = await apiClient.get<ApiSuccessResponse<Notification[]>>(
    mePath(collegeSlug),
    { params },
  );

  return {
    ...extractPaginated(data.data, data.meta as NotificationsMeta | undefined),
    unreadCount: (data.meta as NotificationsMeta | undefined)?.unreadCount ?? 0,
  };
}

export async function getUnreadCount(collegeSlug: string): Promise<UnreadCount> {
  const { data } = await apiClient.get<ApiSuccessResponse<UnreadCount>>(
    `${mePath(collegeSlug)}/unread-count`,
  );
  return data.data;
}

export async function markNotificationRead(collegeSlug: string, notificationId: string) {
  const { data } = await apiClient.patch(
    `${mePath(collegeSlug)}/${notificationId}/read`,
  );
  return data.data;
}

export async function markAllNotificationsRead(collegeSlug: string) {
  const { data } = await apiClient.post(`${mePath(collegeSlug)}/mark-all-read`);
  return data.data;
}

export async function deleteNotification(collegeSlug: string, notificationId: string) {
  const { data } = await apiClient.delete(`${mePath(collegeSlug)}/${notificationId}`);
  return data.data;
}
