import {
  Box,
  IconButton,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import { formatDateTime } from '@/utils/format';
import type { Notification } from '@/types/notification.types';

interface NotificationRowProps {
  notification: Notification;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  busy?: boolean;
}

export function NotificationRow({
  notification,
  onMarkRead,
  onDelete,
  busy,
}: NotificationRowProps) {
  return (
    <ListItem
      alignItems="flex-start"
      sx={{
        bgcolor: notification.isRead ? 'transparent' : 'action.hover',
        borderRadius: 2,
        mb: 1,
        border: '1px solid',
        borderColor: 'divider',
      }}
      secondaryAction={
        <Stack direction="row" spacing={0.5}>
          {!notification.isRead && onMarkRead ? (
            <IconButton
              edge="end"
              aria-label="Mark read"
              onClick={() => onMarkRead(notification.id)}
              disabled={busy}
            >
              <MarkEmailReadOutlinedIcon fontSize="small" />
            </IconButton>
          ) : null}
          {onDelete ? (
            <IconButton
              edge="end"
              aria-label="Delete"
              onClick={() => onDelete(notification.id)}
              disabled={busy}
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          ) : null}
        </Stack>
      }
    >
      <ListItemText
        primary={
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', pr: 6 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: notification.isRead ? 500 : 700 }}>
              {notification.title}
            </Typography>
            {!notification.isRead ? (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                }}
              />
            ) : null}
          </Stack>
        }
        secondary={
          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              {notification.body}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDateTime(notification.createdAt)}
            </Typography>
          </Stack>
        }
      />
    </ListItem>
  );
}
