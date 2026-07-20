import { Alert, Grid, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { getClubAnalytics } from '@/api/analytics.api';
import { LoadingBox } from '@/components/common/LoadingBox';
import { StatCard } from '@/components/common/StatCard';
import { Button } from '@mui/material';
import { useCollegeSlug } from '@/hooks/useCollegeSlug';
import type { ClubAnalytics } from '@/types/analytics.types';
import { formatCents } from '@/utils/money';

export function ClubOverviewPage() {
  const { clubSlug = '' } = useParams();
  const collegeSlug = useCollegeSlug();
  const [analytics, setAnalytics] = useState<ClubAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const data = await getClubAnalytics(collegeSlug, clubSlug);
        if (!cancelled) setAnalytics(data);
      } catch {
        if (!cancelled) setError('Could not load club analytics.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [collegeSlug, clubSlug]);

  if (loading) return <LoadingBox />;
  if (error || !analytics) return <Alert severity="error">{error ?? 'Unavailable'}</Alert>;

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Members" value={analytics.members.total} hint={`${analytics.members.officers} officers`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Events"
            value={analytics.events.total}
            hint={`${analytics.events.upcoming} upcoming`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Attendance rate"
            value={`${analytics.registrations.attendanceRate}%`}
            hint={`${analytics.registrations.attended} attended`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Certificates" value={analytics.certificates.issued} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <StatCard
            label="Budget allocated"
            value={formatCents(analytics.budget.totalAllocatedCents)}
            hint={`${analytics.budget.utilizationRate}% utilized`}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <StatCard
            label="Budget spent"
            value={formatCents(analytics.budget.totalSpentCents)}
          />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={1}>
        <Button component={RouterLink} to={`/dashboard/clubs/${clubSlug}/events`} variant="contained">
          Manage events
        </Button>
        <Button component={RouterLink} to={`/dashboard/clubs/${clubSlug}/budget`} variant="outlined">
          View budget
        </Button>
      </Stack>
    </Stack>
  );
}
