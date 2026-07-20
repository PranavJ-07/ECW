import { Box, Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        <Typography variant="h3">404</Typography>
        <Typography variant="body1" color="text.secondary">
          The page you requested does not exist.
        </Typography>
        <Button component={Link} to="/dashboard" variant="contained">
          Go to dashboard
        </Button>
      </Stack>
    </Box>
  );
}
