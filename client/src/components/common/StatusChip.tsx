import { Chip, type ChipProps } from '@mui/material';
import type { RegistrationStatus } from '@/types/registration.types';

const registrationColors: Record<RegistrationStatus, ChipProps['color']> = {
  registered: 'primary',
  waitlisted: 'warning',
  cancelled: 'default',
  attended: 'success',
  no_show: 'error',
};

const registrationLabels: Record<RegistrationStatus, string> = {
  registered: 'Registered',
  waitlisted: 'Waitlisted',
  cancelled: 'Cancelled',
  attended: 'Attended',
  no_show: 'No show',
};

export function RegistrationStatusChip({ status }: { status: RegistrationStatus }) {
  return (
    <Chip
      size="small"
      label={registrationLabels[status]}
      color={registrationColors[status]}
      variant={status === 'cancelled' ? 'outlined' : 'filled'}
    />
  );
}

export function EventStatusChip({ status }: { status: string }) {
  const color =
    status === 'published'
      ? 'success'
      : status === 'cancelled'
        ? 'error'
        : status === 'completed'
          ? 'default'
          : 'warning';

  return <Chip size="small" label={status.replace('_', ' ')} color={color} variant="outlined" />;
}
