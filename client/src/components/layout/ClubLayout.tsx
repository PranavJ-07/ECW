import { Navigate, Outlet, useParams } from 'react-router-dom';
import { Box, CircularProgress, Stack, Tab, Tabs, Typography } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useClubContext } from '@/context/ClubContext';

export function ClubLayout() {
  const { clubSlug = '' } = useParams();
  const location = useLocation();
  const { isLoading, getClubBySlug, isOfficerOf } = useClubContext();
  const club = getClubBySlug(clubSlug);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isOfficerOf(clubSlug)) {
    return <Navigate to="/dashboard/clubs" replace />;
  }

  const basePath = `/dashboard/clubs/${clubSlug}`;
  const tabValue =
    location.pathname === basePath
      ? 0
      : location.pathname.startsWith(`${basePath}/events`)
        ? 1
        : location.pathname.startsWith(`${basePath}/budget`)
          ? 2
          : 0;

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="overline" color="text.secondary">
          Club dashboard
        </Typography>
        <Typography variant="h4">{club?.name ?? clubSlug}</Typography>
        {club ? (
          <Typography variant="body2" color="text.secondary">
            Your role: {club.role}
          </Typography>
        ) : null}
      </Stack>

      <Tabs value={tabValue}>
        <Tab label="Overview" component={RouterLink} to={basePath} />
        <Tab label="Events" component={RouterLink} to={`${basePath}/events`} />
        <Tab label="Budget" component={RouterLink} to={`${basePath}/budget`} />
      </Tabs>

      <Outlet />
    </Stack>
  );
}
