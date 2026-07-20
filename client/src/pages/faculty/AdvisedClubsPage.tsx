import { Alert, Grid, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getMyAdvisedClubs } from '@/api/clubs.api';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingBox } from '@/components/common/LoadingBox';
import { PageHeader } from '@/components/common/PageHeader';
import { useCollegeSlug } from '@/hooks/useCollegeSlug';
import type { ClubSummary } from '@/types/club.types';
import { Card, CardActionArea, CardContent, Chip } from '@mui/material';

export function AdvisedClubsPage() {
  const collegeSlug = useCollegeSlug();
  const [clubs, setClubs] = useState<ClubSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const data = await getMyAdvisedClubs(collegeSlug);
        if (!cancelled) setClubs(data);
      } catch {
        if (!cancelled) setError('Could not load advised clubs. Faculty role required.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [collegeSlug]);

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Advised clubs"
        subtitle="Clubs where you are listed as faculty advisor"
      />

      {error ? <Alert severity="error">{error}</Alert> : null}

      {loading ? (
        <LoadingBox />
      ) : clubs.length ? (
        <Grid container spacing={2}>
          {clubs.map((club) => (
            <Grid key={club.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea
                  component={RouterLink}
                  to={`/dashboard/advised-clubs/${club.slug}`}
                  sx={{ height: '100%' }}
                >
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="h6">{club.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {club.description ?? 'No description'}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip size="small" label={`${club.memberCount} members`} />
                        <Chip size="small" label={club.category} variant="outlined" />
                      </Stack>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <EmptyState
          title="No advised clubs"
          description="Clubs will appear here once you are assigned as faculty advisor."
        />
      )}
    </Stack>
  );
}
