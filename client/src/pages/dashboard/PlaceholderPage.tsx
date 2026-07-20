import { Box, Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <Stack spacing={2}>
      <Typography variant="h4">{title}</Typography>
      <Typography variant="body1" color="text.secondary">
        This section is not built yet. The route and layout shell are ready for feature work.
      </Typography>
      <Box>
        <Button component={Link} to="/dashboard" variant="outlined">
          Back to overview
        </Button>
      </Box>
    </Stack>
  );
}
