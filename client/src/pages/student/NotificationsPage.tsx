import { Alert, Button, List, Pagination, Stack, Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  deleteNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/api/notifications.api';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingBox } from '@/components/common/LoadingBox';
import { PageHeader } from '@/components/common/PageHeader';
import { NotificationRow } from '@/components/student/NotificationRow';
import { useCollegeSlug } from '@/hooks/useCollegeSlug';
import type { Notification } from '@/types/notification.types';

export function NotificationsPage() {
  const collegeSlug = useCollegeSlug();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await listNotifications(collegeSlug, {
        page,
        limit: 10,
        isRead: filter === 'unread' ? false : undefined,
      });

      setNotifications(result.items);
      setTotalPages(result.meta.totalPages);
      setUnreadCount(result.unreadCount);
    } catch {
      setError('Could not load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, [collegeSlug, page, filter]);

  const handleMarkRead = async (notificationId: string) => {
    setBusyId(notificationId);
    try {
      await markNotificationRead(collegeSlug, notificationId);
      await loadNotifications();
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (notificationId: string) => {
    setBusyId(notificationId);
    try {
      await deleteNotification(collegeSlug, notificationId);
      await loadNotifications();
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead(collegeSlug);
    await loadNotifications();
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount ? `${unreadCount} unread` : 'You are all caught up'}
        action={
          unreadCount ? (
            <Button variant="outlined" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          ) : undefined
        }
      />

      <Tabs
        value={filter === 'all' ? 0 : 1}
        onChange={(_, index) => {
          setPage(1);
          setFilter(index === 0 ? 'all' : 'unread');
        }}
      >
        <Tab label="All" />
        <Tab label="Unread" />
      </Tabs>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {loading ? (
        <LoadingBox />
      ) : notifications.length ? (
        <>
          <List disablePadding>
            {notifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
                busy={busyId === notification.id}
              />
            ))}
          </List>

          {totalPages > 1 ? (
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              sx={{ alignSelf: 'center' }}
            />
          ) : null}
        </>
      ) : (
        <EmptyState
          title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          description="Updates about your events and certificates will show up here."
        />
      )}
    </Stack>
  );
}
