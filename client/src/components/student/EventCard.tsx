import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { EventStatusChip } from '@/components/common/StatusChip';
import { formatDateTime } from '@/utils/format';
import type { EventSummary } from '@/types/event.types';

interface EventCardProps {
  event: EventSummary;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  loadingAction?: boolean;
}

export function EventCard({
  event,
  actionLabel = 'View details',
  actionTo,
  onAction,
  loadingAction,
}: EventCardProps) {
  const fillPercent =
    event.capacity && event.capacity > 0
      ? Math.min(100, Math.round((event.registrationCount / event.capacity) * 100))
      : null;

  const locationLabel =
    event.location.mode === 'online'
      ? 'Online'
      : event.location.venueName ?? event.location.address ?? 'On campus';

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'start' }}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                {event.clubName ?? 'Club event'}
              </Typography>
              <Typography variant="h6">{event.title}</Typography>
            </Box>
            <EventStatusChip status={event.status} />
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {formatDateTime(event.startAt)}
          </Typography>

          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <LocationOnOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {locationLabel}
            </Typography>
          </Stack>

          {fillPercent !== null ? (
            <Box>
              <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {event.registrationCount} / {event.capacity} registered
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {fillPercent}%
                </Typography>
              </Stack>
              <LinearProgress variant="determinate" value={fillPercent} />
            </Box>
          ) : (
            <Typography variant="caption" color="text.secondary">
              {event.registrationCount} registered
            </Typography>
          )}
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        {actionTo ? (
          <Button component={RouterLink} to={actionTo} size="small">
            {actionLabel}
          </Button>
        ) : (
          <Button size="small" onClick={onAction} disabled={loadingAction}>
            {loadingAction ? 'Working…' : actionLabel}
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
