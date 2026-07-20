import { Box, CircularProgress } from '@mui/material';

export function LoadingBox({ minHeight = 240 }: { minHeight?: number }) {
  return (
    <Box
      sx={{
        minHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress />
    </Box>
  );
}
