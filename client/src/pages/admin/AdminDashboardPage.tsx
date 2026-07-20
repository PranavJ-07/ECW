import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import {
  Alert,
  Button,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getCollegeOverview } from '@/api/analytics.api';
import { getUnreadCount } from '@/api/notifications.api';
import { RegistrationTrendChart } from '@/components/admin/RegistrationTrendChart';
import { LoadingBox } from '@/components/common/LoadingBox';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { useAuth } from '@/context/AuthContext';
import { useCollegeSlug } from '@/hooks/useCollegeSlug';
import type { CollegeOverviewAnalytics } from '@/types/analytics.types';

export function AdminDashboardPage() {
  const { user, college } = useAuth();
  const collegeSlug = useCollegeSlug();
  const [analytics, setAnalytics] = useState<CollegeOverviewAnalytics | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const [overview, unread] = await Promise.all([
          getCollegeOverview(collegeSlug),
          getUnreadCount(collegeSlug),
        ]);

        if (!cancelled) {
          setAnalytics(overview);
          setUnreadNotifications(unread.total);
        }
      } catch {
        if (!cancelled) setError('Could not load college overview.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [collegeSlug]);

  if (loading) return <LoadingBox minHeight={360} />;
  if (error || !analytics) return <Alert severity="error">{error ?? 'Unavailable'}</Alert>;

  return (
    <Stack spacing={3}>
      <PageHeader
        title={`College admin — ${user?.firstName ?? 'Admin'}`}
        subtitle={`Platform overview for ${college?.name ?? 'your college'}`}
        action={
          <Button component={RouterLink} to="/dashboard/analytics" variant="contained">
            Full analytics
          </Button>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard label="Active clubs" value={analytics.clubs.active} icon={<GroupsOutlinedIcon color="primary" />} hint={`${analytics.clubs.total} total`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard label="Published events" value={analytics.events.published} icon={<EventOutlinedIcon color="primary" />} hint={`${analytics.events.upcoming} upcoming`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard label="Registrations" value={analytics.registrations.total} icon={<HowToRegOutlinedIcon color="primary" />} hint={`${analytics.registrations.attendanceRate}% attended`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard label="Active members" value={analytics.memberships.active} icon={<GroupsOutlinedIcon color="primary" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard label="Certificates" value={analytics.certificates.issued} icon={<EmojiEventsOutlinedIcon color="primary" />} hint={`${unreadNotifications} unread alerts`} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 3 }}>
            <RegistrationTrendChart data={analytics.registrationTrend} />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">Top clubs</Typography>
              <Typography variant="body2" color="text.secondary">
                Ranked by member count
              </Typography>
              {analytics.topClubs.length ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Club</TableCell>
                        <TableCell align="right">Members</TableCell>
                        <TableCell align="right">Events</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.topClubs.map((club) => (
                        <TableRow key={club.clubId} hover>
                          <TableCell>
                            <Button
                              component={RouterLink}
                              to={`/dashboard/admin/clubs/${club.slug}`}
                              size="small"
                              sx={{ textTransform: 'none', p: 0, minWidth: 0 }}
                            >
                              {club.name}
                            </Button>
                          </TableCell>
                          <TableCell align="right">{club.memberCount}</TableCell>
                          <TableCell align="right">{club.eventCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">No club data yet.</Alert>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        <Button component={RouterLink} to="/dashboard/admin/clubs" variant="outlined">
          Manage clubs
        </Button>
        <Button component={RouterLink} to="/dashboard/admin/events" variant="outlined">
          Campus events
        </Button>
        <Button component={RouterLink} to="/dashboard/notifications" variant="outlined">
          Notifications
        </Button>
      </Stack>
    </Stack>
  );
}
