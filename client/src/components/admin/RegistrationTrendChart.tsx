import { Box, Stack, Typography } from '@mui/material';
import type { TrendPoint } from '@/types/analytics.types';

interface RegistrationTrendChartProps {
  data: TrendPoint[];
  title?: string;
}

export function RegistrationTrendChart({ data, title = 'Registration trend' }: RegistrationTrendChartProps) {
  if (!data.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        No trend data for this period.
      </Typography>
    );
  }

  const maxCount = Math.max(...data.map((point) => point.count), 1);

  return (
    <Stack spacing={2}>
      <Typography variant="h6">{title}</Typography>
      {data.map((point) => (
        <Stack key={point.period} spacing={0.5}>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2">{point.period}</Typography>
            <Typography variant="body2" color="text.secondary">
              {point.count}
            </Typography>
          </Stack>
          <Box
            sx={{
              height: 8,
              borderRadius: 1,
              bgcolor: 'action.hover',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${(point.count / maxCount) * 100}%`,
                bgcolor: 'primary.main',
                borderRadius: 1,
              }}
            />
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}
