import {
  Alert,
  Button,
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
import { isAxiosError } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { getEventAnalytics } from '@/api/analytics.api';
import { cancelEvent, getEvent, publishEvent } from '@/api/events.api';
import { listEventRegistrations } from '@/api/registrations.api';
import { EventStatusChip, RegistrationStatusChip } from '@/components/common/StatusChip';
import { LoadingBox } from '@/components/common/LoadingBox';
import { PageHeader } from '@/components/common/PageHeader';
import { useCollegeSlug } from '@/hooks/useCollegeSlug';
import type { EventAnalytics } from '@/types/analytics.types';
import type { EventDetail } from '@/types/event.types';
import type { RegistrationWithUser } from '@/api/registrations.api';
import { formatDateTime } from '@/utils/format';

export function ManageClubEventPage() {
  const { clubSlug = '', eventSlug = '' } = useParams();
  const collegeSlug = useCollegeSlug();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [eventData, analyticsData, registrationResult] = await Promise.all([
        getEvent(collegeSlug, eventSlug),
        getEventAnalytics(collegeSlug, eventSlug).catch(() => null),
        listEventRegistrations(collegeSlug, eventSlug, { limit: 20 }),
      ]);

      setEvent(eventData);
      setAnalytics(analyticsData);
      setRegistrations(registrationResult.items);
    } catch {
      setError('Could not load event management view.');
    } finally {
      setLoading(false);
    }
  }, [collegeSlug, eventSlug]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const runAction = async (action: () => Promise<unknown>) => {
    setActionLoading(true);
    setActionError(null);

    try {
      await action();
      await loadData();
    } catch (err) {
      const message = isAxiosError(err)
        ? ((err.response?.data as { error?: { message?: string } })?.error?.message ??
          'Action failed')
        : 'Action failed';
      setActionError(message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingBox minHeight={360} />;
  if (error || !event) return <Alert severity="error">{error ?? 'Event not found'}</Alert>;

  return (
    <Stack spacing={3}>
      <PageHeader
        title={event.title}
        subtitle={`Manage registrations and lifecycle`}
        action={
          <Button component={RouterLink} to={`/dashboard/clubs/${clubSlug}/events`} variant="outlined">
            Back to events
          </Button>
        }
      />

      {actionError ? <Alert severity="error">{actionError}</Alert> : null}

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        <EventStatusChip status={event.status} />
        <Chip label={`${event.registrationCount} registered`} variant="outlined" size="small" />
        {event.capacity ? (
          <Chip label={`Capacity ${event.capacity}`} variant="outlined" size="small" />
        ) : null}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {event.status === 'draft' ? (
          <Button
            variant="contained"
            disabled={actionLoading}
            onClick={() => runAction(() => publishEvent(collegeSlug, eventSlug))}
          >
            Publish event
          </Button>
        ) : null}
        {event.status === 'published' ? (
          <Button
            variant="outlined"
            color="error"
            disabled={actionLoading}
            onClick={() => runAction(() => cancelEvent(collegeSlug, eventSlug, 'Cancelled by officer'))}
          >
            Cancel event
          </Button>
        ) : null}
      </Stack>

      {analytics ? (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="overline" color="text.secondary">
                Fill rate
              </Typography>
              <Typography variant="h5">{analytics.fillRate}%</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="overline" color="text.secondary">
                Attended
              </Typography>
              <Typography variant="h5">{analytics.attendance.attended}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="overline" color="text.secondary">
                QR check-ins
              </Typography>
              <Typography variant="h5">{analytics.checkIns.qrScan}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="overline" color="text.secondary">
                Certificates
              </Typography>
              <Typography variant="h5">{analytics.certificates.issued}</Typography>
            </Paper>
          </Grid>
        </Grid>
      ) : null}

      <Stack spacing={1}>
        <Typography variant="h6">Registrations</Typography>
        {registrations.length ? (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Attendee</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Registered</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {registrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell>
                      {registration.user.firstName} {registration.user.lastName}
                    </TableCell>
                    <TableCell>{registration.user.email}</TableCell>
                    <TableCell>{formatDateTime(registration.registeredAt)}</TableCell>
                    <TableCell>
                      <RegistrationStatusChip status={registration.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">No registrations yet.</Alert>
        )}
      </Stack>
    </Stack>
  );
}
