import {
  Alert,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getCollegeOverview } from '@/api/analytics.api';
import { RegistrationTrendChart } from '@/components/admin/RegistrationTrendChart';
import { LoadingBox } from '@/components/common/LoadingBox';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { useCollegeSlug } from '@/hooks/useCollegeSlug';
import type { CollegeOverviewAnalytics } from '@/types/analytics.types';
import { Button } from '@mui/material';

export function CollegeAnalyticsPage() {
  const collegeSlug = useCollegeSlug();
  const [analytics, setAnalytics] = useState<CollegeOverviewAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const data = await getCollegeOverview(collegeSlug);
        if (!cancelled) setAnalytics(data);
      } catch {
        if (!cancelled) setError('Could not load college analytics.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [collegeSlug]);

  if (loading) return <LoadingBox minHeight={360} />;
  if (error || !analytics) return <Alert severity="error">{error ?? 'Unavailable'}</Alert>;

  return (
    <Stack spacing={3}>
      <PageHeader
        title="College analytics"
        subtitle={`Generated ${new Date(analytics.generatedAt).toLocaleString()}`}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Clubs" value={`${analytics.clubs.active} active`} hint={`${analytics.clubs.total} total`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Events" value={analytics.events.total} hint={`${analytics.events.cancelled} cancelled`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Attendance rate" value={`${analytics.registrations.attendanceRate}%`} hint={`${analytics.registrations.attended} attended`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Memberships" value={analytics.memberships.active} hint={`${analytics.certificates.issued} certificates`} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <RegistrationTrendChart data={analytics.registrationTrend} title="6-month registration trend" />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">Event breakdown</Typography>
              <StatCard label="Published" value={analytics.events.published} />
              <StatCard label="Upcoming" value={analytics.events.upcoming} />
              <StatCard label="Cancelled" value={analytics.events.cancelled} />
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">Top performing clubs</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Club</TableCell>
                  <TableCell align="right">Members</TableCell>
                  <TableCell align="right">Events</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analytics.topClubs.map((club) => (
                  <TableRow key={club.clubId} hover>
                    <TableCell>{club.name}</TableCell>
                    <TableCell align="right">{club.memberCount}</TableCell>
                    <TableCell align="right">{club.eventCount}</TableCell>
                    <TableCell align="right">
                      <Button
                        component={RouterLink}
                        to={`/dashboard/admin/clubs/${club.slug}`}
                        size="small"
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Paper>
    </Stack>
  );
}
