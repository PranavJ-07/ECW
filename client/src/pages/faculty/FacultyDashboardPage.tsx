import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { Alert, Button, Grid, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getMyAdvisedClubs, listClubs } from '@/api/clubs.api';
import { listEvents } from '@/api/events.api';
import { getUnreadCount } from '@/api/notifications.api';
import { EmptyState } from '@/components/common/EmptyState';
import { EventCard } from '@/components/student/EventCard';
import { LoadingBox } from '@/components/common/LoadingBox';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { useAuth } from '@/context/AuthContext';
import { useCollegeSlug } from '@/hooks/useCollegeSlug';
import type { ClubSummary } from '@/types/club.types';
import type { EventSummary } from '@/types/event.types';
import { isUpcoming } from '@/utils/format';

export function FacultyDashboardPage() {
  const { user, college } = useAuth();
  const collegeSlug = useCollegeSlug();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [advisedClubs, setAdvisedClubs] = useState<ClubSummary[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventSummary[]>([]);
  const [activeClubs, setActiveClubs] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const [advised, eventsResult, clubsResult, unread] = await Promise.all([
          getMyAdvisedClubs(collegeSlug),
          listEvents(collegeSlug, { status: 'published', limit: 6 }),
          listClubs(collegeSlug, { limit: 1 }),
          getUnreadCount(collegeSlug),
        ]);

        if (cancelled) return;

        setAdvisedClubs(advised);
        setUpcomingEvents(eventsResult.items.filter((event) => isUpcoming(event.startAt)).slice(0, 3));
        setActiveClubs(clubsResult.meta.total);
        setUnreadNotifications(unread.total);
      } catch {
        if (!cancelled) {
          setError('Could not load faculty dashboard.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [collegeSlug]);

  if (loading) return <LoadingBox minHeight={360} />;

  return (
    <Stack spacing={3}>
      <PageHeader
        title={`Welcome, ${user?.firstName ?? 'Faculty'}`}
        subtitle={`Faculty view for ${college?.name ?? 'your college'}`}
        action={
          <Button component={RouterLink} to="/dashboard/advised-clubs" variant="contained">
            My advised clubs
          </Button>
        }
      />

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Advised clubs"
            value={advisedClubs.length}
            icon={<SchoolOutlinedIcon color="primary" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Active clubs"
            value={activeClubs}
            icon={<GroupsOutlinedIcon color="primary" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Upcoming events"
            value={upcomingEvents.length}
            icon={<EventOutlinedIcon color="primary" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Unread notifications"
            value={unreadNotifications}
            icon={<NotificationsActiveOutlinedIcon color="primary" />}
          />
        </Grid>
      </Grid>

      <Stack spacing={2}>
        <PageHeader
          title="Advised clubs"
          subtitle="Clubs where you are the faculty advisor"
          action={
            advisedClubs.length ? (
              <Button component={RouterLink} to="/dashboard/advised-clubs" size="small">
                View all
              </Button>
            ) : undefined
          }
        />

        {advisedClubs.length ? (
          <Grid container spacing={2}>
            {advisedClubs.slice(0, 3).map((club) => (
              <Grid key={club.id} size={{ xs: 12, md: 4 }}>
                <ClubPreviewCard club={club} basePath="/dashboard/advised-clubs" />
              </Grid>
            ))}
          </Grid>
        ) : (
          <EmptyState
            title="No advised clubs assigned"
            description="When a club lists you as faculty advisor, it will appear here."
          />
        )}
      </Stack>

      <Stack spacing={2}>
        <PageHeader
          title="Upcoming campus events"
          subtitle="Published events across the college"
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
                <EventCard event={event} actionTo={`/dashboard/events/${event.slug}`} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <EmptyState title="No upcoming events" description="Check back later for new campus events." />
        )}
      </Stack>
    </Stack>
  );
}

function ClubPreviewCard({ club, basePath }: { club: ClubSummary; basePath: string }) {
  return (
    <Stack
      component={RouterLink}
      to={`${basePath}/${club.slug}`}
      spacing={0.5}
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        textDecoration: 'none',
        color: 'inherit',
        bgcolor: 'background.paper',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Typography variant="h6">{club.name}</Typography>
      <Typography variant="body2" color="text.secondary">
        {club.memberCount} members · {club.category}
      </Typography>
    </Stack>
  );
}
