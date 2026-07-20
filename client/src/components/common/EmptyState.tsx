import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Box
      sx={{
        py: 6,
        px: 2,
        textAlign: 'center',
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: action ? 2 : 0 }}>
          {description}
        </Typography>
      ) : null}
      {action}
    </Box>
  );
}
