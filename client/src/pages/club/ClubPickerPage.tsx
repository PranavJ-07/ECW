import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import { Button, Card, CardActionArea, CardContent, Grid, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingBox } from '@/components/common/LoadingBox';
import { PageHeader } from '@/components/common/PageHeader';
import { useClubContext } from '@/context/ClubContext';
import { isCollegeAdmin } from '@/utils/roles';
import { useAuth } from '@/context/AuthContext';

export function ClubPickerPage() {
  const { officerClubs, isLoading } = useClubContext();
  const { user } = useAuth();
  const isAdmin = user ? isCollegeAdmin(user.roles) : false;

  if (isLoading) {
    return <LoadingBox minHeight={320} />;
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Club dashboard"
        subtitle="Manage clubs where you are an officer"
      />

      {officerClubs.length ? (
        <Grid container spacing={2}>
          {officerClubs.map((club) => (
            <Grid key={club.clubId} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card>
                <CardActionArea component={RouterLink} to={`/dashboard/clubs/${club.slug}`}>
                  <CardContent>
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <GroupsOutlinedIcon color="primary" />
                        <Typography variant="h6">{club.name}</Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        Role: {club.role} · {club.memberCount} members
                      </Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <EmptyState
          title="No officer clubs"
          description={
            isAdmin
              ? 'You are a college admin but not assigned as a club officer. Use the admin analytics section or join a club as an officer.'
              : 'You need an officer, president, or treasurer role in a club to access this dashboard.'
          }
          action={
            <Button component={RouterLink} to="/dashboard" variant="outlined">
              Back to student dashboard
            </Button>
          }
        />
      )}
    </Stack>
  );
}
