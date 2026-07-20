import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { isAxiosError } from 'axios';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
  cancelRegistration,
  getEvent,
  registerForEvent,
} from '@/api/events.api';
import { listMyRegistrations } from '@/api/registrations.api';
import { EventStatusChip } from '@/components/common/StatusChip';
import { LoadingBox } from '@/components/common/LoadingBox';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useCollegeSlug } from '@/hooks/useCollegeSlug';
import { hasPermission } from '@/utils/roles';
import type { EventDetail } from '@/types/event.types';
import type { RegistrationWithEvent } from '@/types/registration.types';
import { formatDateTime } from '@/utils/format';

export function EventDetailPage() {
  const { eventSlug = '' } = useParams();
  const { permissions } = useAuth();
  const collegeSlug = useCollegeSlug();
  const canRegister = hasPermission(permissions, 'events:register');
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [registration, setRegistration] = useState<RegistrationWithEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const eventData = await getEvent(collegeSlug, eventSlug);
      setEvent(eventData);

      if (canRegister) {
        const registrationsResult = await listMyRegistrations(collegeSlug, { limit: 100 });
        setRegistration(
          registrationsResult.items.find((item) => item.event.slug === eventSlug) ?? null,
        );
      } else {
        setRegistration(null);
      }
    } catch {
      setError('Event not found or unavailable.');
    } finally {
      setLoading(false);
    }
  }, [collegeSlug, eventSlug, canRegister]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleRegister = async () => {
    setActionLoading(true);
    setActionError(null);

    try {
      await registerForEvent(collegeSlug, eventSlug);
      await loadData();
    } catch (err) {
      const message = isAxiosError(err)
        ? ((err.response?.data as { error?: { message?: string } })?.error?.message ??
          'Registration failed')
        : 'Registration failed';
      setActionError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    setActionError(null);

    try {
      await cancelRegistration(collegeSlug, eventSlug);
      await loadData();
    } catch (err) {
      const message = isAxiosError(err)
        ? ((err.response?.data as { error?: { message?: string } })?.error?.message ??
          'Cancellation failed')
        : 'Cancellation failed';
      setActionError(message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingBox minHeight={360} />;
  }

  if (error || !event) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">{error ?? 'Event not found'}</Alert>
        <Button component={RouterLink} to="/dashboard/events" variant="outlined">
          Back to events
        </Button>
      </Stack>
    );
  }

  const isRegistered =
    registration?.status === 'registered' || registration?.status === 'waitlisted';
  const isFull = event.capacity ? event.registrationCount >= event.capacity : false;

  const locationLabel =
    event.location.mode === 'online'
      ? event.location.meetingUrl ?? 'Online event'
      : event.location.venueName ?? event.location.address ?? 'On campus';

  return (
    <Stack spacing={3}>
      <PageHeader
        title={event.title}
        subtitle={event.clubName ?? 'Club event'}
        action={
          <Button variant="outlined" onClick={() => navigate('/dashboard/events')}>
            Back
          </Button>
        }
      />

      {actionError ? <Alert severity="error">{actionError}</Alert> : null}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <EventStatusChip status={event.status} />
                {event.requiresApproval ? (
                  <Chip size="small" label="Approval required" variant="outlined" />
                ) : null}
              </Stack>

              <Typography variant="body1" color="text.secondary">
                {event.description ?? 'No description provided.'}
              </Typography>

              <Divider />

              <InfoRow label="Starts" value={formatDateTime(event.startAt)} />
              <InfoRow label="Ends" value={formatDateTime(event.endAt)} />
              <InfoRow
                label="Location"
                value={locationLabel}
                icon={<LocationOnOutlinedIcon fontSize="small" />}
              />

              {event.tags.length ? (
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  {event.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Stack>
              ) : null}
            </Stack>
          </Paper>
        </Grid>

        {canRegister ? (
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Typography variant="h6">Registration</Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.registrationCount}
                  {event.capacity ? ` / ${event.capacity}` : ''} registered
                </Typography>

                {registration ? (
                  <Chip
                    label={`Your status: ${registration.status}`}
                    color={registration.status === 'waitlisted' ? 'warning' : 'primary'}
                  />
                ) : null}

                {isRegistered ? (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleCancel}
                    disabled={actionLoading}
                  >
                    Cancel registration
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleRegister}
                    disabled={actionLoading || event.status !== 'published' || isFull}
                  >
                    {isFull ? 'Event full' : 'Register'}
                  </Button>
                )}

                {event.status !== 'published' ? (
                  <Typography variant="caption" color="text.secondary">
                    Registration is only open for published events.
                  </Typography>
                ) : null}
              </Stack>
            </Paper>
          </Grid>
        ) : (
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Typography variant="h6">Attendance</Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.registrationCount}
                  {event.capacity ? ` / ${event.capacity}` : ''} registered
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Faculty view — registration is not available for your role.
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Stack>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      {icon}
      <Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2">{value}</Typography>
      </Box>
    </Stack>
  );
}
