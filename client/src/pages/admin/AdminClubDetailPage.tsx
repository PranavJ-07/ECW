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
import { Link as RouterLink, useParams } from 'react-router-dom';
import { getClubAnalytics } from '@/api/analytics.api';
import { getClub } from '@/api/clubs.api';
import { listEvents } from '@/api/events.api';
import { LoadingBox } from '@/components/common/LoadingBox';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { EventStatusChip } from '@/components/common/StatusChip';
import { useCollegeSlug } from '@/hooks/useCollegeSlug';
import type { ClubAnalytics } from '@/types/analytics.types';
import type { ClubDetail } from '@/types/club.types';
import type { EventSummary } from '@/types/event.types';
import { formatCents } from '@/utils/money';
import { formatDateTime } from '@/utils/format';

export function AdminClubDetailPage() {
  const { clubSlug = '' } = useParams();
  const collegeSlug = useCollegeSlug();
  const [club, setClub] = useState<ClubDetail | null>(null);
  const [analytics, setAnalytics] = useState<ClubAnalytics | null>(null);
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const [clubData, analyticsData, eventsResult] = await Promise.all([
          getClub(collegeSlug, clubSlug),
          getClubAnalytics(collegeSlug, clubSlug),
          listEvents(collegeSlug, { clubSlug, limit: 20 }),
        ]);

        if (!cancelled) {
          setClub(clubData);
          setAnalytics(analyticsData);
          setEvents(eventsResult.items);
        }
      } catch {
        if (!cancelled) setError('Club not found or analytics unavailable.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [collegeSlug, clubSlug]);

  if (loading) return <LoadingBox minHeight={360} />;
  if (error || !club || !analytics) return <Alert severity="error">{error ?? 'Unavailable'}</Alert>;

  return (
    <Stack spacing={3}>
      <PageHeader
        title={club.name}
        subtitle="Club analytics and activity"
        action={
          <Button component={RouterLink} to="/dashboard/admin/clubs" variant="outlined">
            Back to clubs
          </Button>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Members" value={analytics.members.total} hint={`${analytics.members.officers} officers`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Events" value={analytics.events.total} hint={`${analytics.events.upcoming} upcoming`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Attendance" value={`${analytics.registrations.attendanceRate}%`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Budget spent"
            value={formatCents(analytics.budget.totalSpentCents)}
            hint={`${analytics.budget.utilizationRate}% utilized`}
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={1}>
          <Typography variant="body1" color="text.secondary">
            {club.description ?? 'No description'}
          </Typography>
          <Typography variant="body2">Category: {club.category}</Typography>
          <Typography variant="body2">Status: {club.status}</Typography>
        </Stack>
      </Paper>

      <Stack spacing={1}>
        <Typography variant="h6">Club events</Typography>
        {events.length ? (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  <TableCell>When</TableCell>
                  <TableCell>Registrations</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>{formatDateTime(event.startAt)}</TableCell>
                    <TableCell>{event.registrationCount}</TableCell>
                    <TableCell>
                      <EventStatusChip status={event.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">No events for this club.</Alert>
        )}
      </Stack>
    </Stack>
  );
}
