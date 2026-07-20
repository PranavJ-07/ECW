import {
  IconButton,
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
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { RegistrationStatusChip } from '@/components/common/StatusChip';
import { formatDateTime } from '@/utils/format';
import type { RegistrationWithEvent } from '@/types/registration.types';

interface RegistrationTableProps {
  registrations: RegistrationWithEvent[];
}

export function RegistrationTable({ registrations }: RegistrationTableProps) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Event</TableCell>
            <TableCell>Club</TableCell>
            <TableCell>When</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {registrations.map((registration) => (
            <TableRow key={registration.id} hover>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {registration.event.title}
                </Typography>
              </TableCell>
              <TableCell>{registration.event.clubName ?? '—'}</TableCell>
              <TableCell>{formatDateTime(registration.event.startAt)}</TableCell>
              <TableCell>
                <RegistrationStatusChip status={registration.status} />
              </TableCell>
              <TableCell align="right">
                <IconButton
                  component={RouterLink}
                  to={`/dashboard/events/${registration.event.slug}`}
                  size="small"
                  aria-label="View event"
                >
                  <OpenInNewOutlinedIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function RegistrationListItem({ registration }: { registration: RegistrationWithEvent }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between' }}>
        <BoxContent registration={registration} />
        <RegistrationStatusChip status={registration.status} />
      </Stack>
    </Paper>
  );
}

function BoxContent({ registration }: { registration: RegistrationWithEvent }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="subtitle1">{registration.event.title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {registration.event.clubName ?? 'Club event'} · {formatDateTime(registration.event.startAt)}
      </Typography>
    </Stack>
  );
}
