import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import UpcomingOutlinedIcon from '@mui/icons-material/UpcomingOutlined';
import { Alert, Button, Grid, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { listEvents } from '@/api/events.api';
import { listMyCertificates } from '@/api/certificates.api';
import { getUnreadCount } from '@/api/notifications.api';
import { listMyRegistrations } from '@/api/registrations.api';
import { EmptyState } from '@/components/common/EmptyState';
import { EventCard } from '@/components/student/EventCard';
import { LoadingBox } from '@/components/common/LoadingBox';
import { PageHeader } from '@/components/common/PageHeader';
import { RegistrationListItem } from '@/components/student/RegistrationTable';
import { StatCard } from '@/components/common/StatCard';
import { useAuth } from '@/context/AuthContext';
import { useCollegeSlug } from '@/hooks/useCollegeSlug';
import type { EventSummary } from '@/types/event.types';
import type { RegistrationWithEvent } from '@/types/registration.types';
import { isUpcoming } from '@/utils/format';

interface DashboardStats {
  upcomingEvents: number;
  activeRegistrations: number;
  certificates: number;
  unreadNotifications: number;
}

export function StudentDashboardPage() {
  const { user, college } = useAuth();
  const collegeSlug = useCollegeSlug();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    upcomingEvents: 0,
    activeRegistrations: 0,
    certificates: 0,
    unreadNotifications: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState<EventSummary[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<RegistrationWithEvent[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const [eventsResult, registrationsResult, certificatesResult, unread] = await Promise.all([
          listEvents(collegeSlug, { status: 'published', limit: 6 }),
          listMyRegistrations(collegeSlug, { limit: 5 }),
          listMyCertificates(collegeSlug, { limit: 1 }),
          getUnreadCount(collegeSlug),
        ]);

        if (cancelled) return;

        const upcoming = eventsResult.items.filter((event) => isUpcoming(event.startAt));
        const activeRegs = registrationsResult.items.filter(
          (registration) =>
            registration.status === 'registered' || registration.status === 'waitlisted',
        );

        setStats({
          upcomingEvents: upcoming.length,
          activeRegistrations: activeRegs.length,
          certificates: certificatesResult.meta.total,
          unreadNotifications: unread.total,
        });
        setUpcomingEvents(upcoming.slice(0, 3));
        setMyRegistrations(activeRegs.slice(0, 3));
      } catch {
        if (!cancelled) {
          setError('Could not load your dashboard. Check that the API is running.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [collegeSlug]);

  if (loading) {
    return <LoadingBox minHeight={360} />;
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title={`Welcome back, ${user?.firstName ?? 'Student'}`}
        subtitle={`Your activity at ${college?.name ?? 'college'}`}
        action={
          <Button component={RouterLink} to="/dashboard/events" variant="contained">
            Browse events
          </Button>
        }
      />

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Upcoming events"
            value={stats.upcomingEvents}
            icon={<UpcomingOutlinedIcon color="primary" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="My registrations"
            value={stats.activeRegistrations}
            icon={<EventAvailableOutlinedIcon color="primary" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Certificates"
            value={stats.certificates}
            icon={<EmojiEventsOutlinedIcon color="primary" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Unread notifications"
            value={stats.unreadNotifications}
            icon={<NotificationsActiveOutlinedIcon color="primary" />}
          />
        </Grid>
      </Grid>

      <Stack spacing={2}>
        <PageHeader
          title="Upcoming events"
          subtitle="Published events you can register for"
          action={
            <Button component={RouterLink} to="/dashboard/events" size="small">
              View all
            </Button>
          }
        />

        {upcomingEvents.length ? (
          <Grid container spacing={2}>
            {upcomingEvents.map((event) => (
              <Grid key={event.id} size={{ xs: 12, md: 4 }}>
                <EventCard
                  event={event}
                  actionLabel="View & register"
                  actionTo={`/dashboard/events/${event.slug}`}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <EmptyState
            title="No upcoming events"
            description="Check back later or browse the full events catalog."
            action={
              <Button component={RouterLink} to="/dashboard/events" variant="outlined">
                Browse events
              </Button>
            }
          />
        )}
      </Stack>

      <Stack spacing={2}>
        <PageHeader
          title="My registrations"
          subtitle="Events you're signed up for"
          action={
            <Button component={RouterLink} to="/dashboard/my-events" size="small">
              View all
            </Button>
          }
        />

        {myRegistrations.length ? (
          <Stack spacing={1.5}>
            {myRegistrations.map((registration) => (
              <RegistrationListItem key={registration.id} registration={registration} />
            ))}
          </Stack>
        ) : (
          <EmptyState
            title="No active registrations"
            description="Register for an event to see it here."
          />
        )}
      </Stack>
    </Stack>
  );
}
