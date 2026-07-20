import {
  Alert,
  Chip,
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
import { getClub } from '@/api/clubs.api';
import { listEvents } from '@/api/events.api';
import { EventStatusChip } from '@/components/common/StatusChip';
import { LoadingBox } from '@/components/common/LoadingBox';
import { PageHeader } from '@/components/common/PageHeader';
import { useCollegeSlug } from '@/hooks/useCollegeSlug';
import type { ClubDetail } from '@/types/club.types';
import type { EventSummary } from '@/types/event.types';
import { formatDateTime } from '@/utils/format';
import { Button } from '@mui/material';

interface FacultyClubDetailPageProps {
  backPath: string;
  backLabel: string;
}

export function FacultyClubDetailPage({ backPath, backLabel }: FacultyClubDetailPageProps) {
  const { clubSlug = '' } = useParams();
  const collegeSlug = useCollegeSlug();
  const [club, setClub] = useState<ClubDetail | null>(null);
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const [clubData, eventsResult] = await Promise.all([
          getClub(collegeSlug, clubSlug),
          listEvents(collegeSlug, { clubSlug, limit: 20 }),
        ]);

        if (!cancelled) {
          setClub(clubData);
          setEvents(eventsResult.items);
        }
      } catch {
        if (!cancelled) setError('Club not found or unavailable.');
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
  if (error || !club) return <Alert severity="error">{error ?? 'Club not found'}</Alert>;

  return (
    <Stack spacing={3}>
      <PageHeader
        title={club.name}
        subtitle="Read-only club overview"
        action={
          <Button component={RouterLink} to={backPath} variant="outlined">
            {backLabel}
          </Button>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Chip label={club.category} size="small" />
                <Chip label={club.status} size="small" variant="outlined" />
                <Chip label={`${club.memberCount} members`} size="small" variant="outlined" />
                <Chip label={`${club.officerCount} officers`} size="small" variant="outlined" />
              </Stack>
              <Typography variant="body1" color="text.secondary">
                {club.description ?? 'No description provided.'}
              </Typography>
              {club.contactEmail ? (
                <Typography variant="body2">Contact: {club.contactEmail}</Typography>
              ) : null}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Stack spacing={1}>
        <Typography variant="h6">Club events</Typography>
        {events.length ? (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  <TableCell>When</TableCell>
                  <TableCell>Registrations</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">View</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id} hover>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>{formatDateTime(event.startAt)}</TableCell>
                    <TableCell>{event.registrationCount}</TableCell>
                    <TableCell>
                      <EventStatusChip status={event.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        component={RouterLink}
                        to={`/dashboard/events/${event.slug}`}
                        size="small"
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">This club has no events yet.</Alert>
        )}
      </Stack>
    </Stack>
  );
}
