import { Alert, Button, Grid, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { listEvents } from '@/api/events.api';
import { EmptyState } from '@/components/common/EmptyState';
import { EventCard } from '@/components/student/EventCard';
import { EventStatusChip } from '@/components/common/StatusChip';
import { LoadingBox } from '@/components/common/LoadingBox';
import { useCollegeSlug } from '@/hooks/useCollegeSlug';
import type { EventSummary } from '@/types/event.types';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { formatDateTime } from '@/utils/format';

export function ClubEventsPage() {
  const { clubSlug = '' } = useParams();
  const collegeSlug = useCollegeSlug();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const result = await listEvents(collegeSlug, { clubSlug, limit: 50 });
        if (!cancelled) setEvents(result.items);
      } catch {
        if (!cancelled) setError('Could not load club events.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [collegeSlug, clubSlug]);

  const upcoming = events.filter((event) => event.status === 'published' || event.status === 'draft');

  return (
    <Stack spacing={3}>
      <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
        <Button
          component={RouterLink}
          to={`/dashboard/clubs/${clubSlug}/events/new`}
          variant="contained"
        >
          Create event
        </Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {loading ? (
        <LoadingBox />
      ) : events.length ? (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  <TableCell>When</TableCell>
                  <TableCell>Registrations</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {event.title}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDateTime(event.startAt)}</TableCell>
                    <TableCell>{event.registrationCount}</TableCell>
                    <TableCell>
                      <EventStatusChip status={event.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        component={RouterLink}
                        to={`/dashboard/clubs/${clubSlug}/events/${event.slug}/manage`}
                        size="small"
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {upcoming.length ? (
            <Grid container spacing={2}>
              {upcoming.slice(0, 3).map((event) => (
                <Grid key={event.id} size={{ xs: 12, md: 4 }}>
                  <EventCard
                    event={event}
                    actionLabel="Manage"
                    actionTo={`/dashboard/clubs/${clubSlug}/events/${event.slug}/manage`}
                  />
                </Grid>
              ))}
            </Grid>
          ) : null}
        </>
      ) : (
        <EmptyState
          title="No events yet"
          description="Create your first club event to start accepting registrations."
          action={
            <Button
              component={RouterLink}
              to={`/dashboard/clubs/${clubSlug}/events/new`}
              variant="contained"
            >
              Create event
            </Button>
          }
        />
      )}
    </Stack>
  );
}
