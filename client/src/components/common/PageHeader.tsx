import { Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
    >
      <Stack spacing={0.5}>
        <Typography variant="h4">{title}</Typography>
        {subtitle ? (
          <Typography variant="body1" color="text.secondary">
            {subtitle}
          </Typography>
        ) : null}
      </Stack>
      {action}
    </Stack>
  );
}
