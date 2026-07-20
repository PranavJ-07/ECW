import { Alert, Paper, Stack, Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { listEvents } from '@/api/events.api';
import { EmptyState } from '@/components/common/EmptyState';
import { EventStatusChip } from '@/components/common/StatusChip';
import { LoadingBox } from '@/components/common/LoadingBox';
import { PageHeader } from '@/components/common/PageHeader';
import { useCollegeSlug } from '@/hooks/useCollegeSlug';
import type { EventSummary } from '@/types/event.types';
import type { EventStatus } from '@/types/event.types';
import { formatDateTime } from '@/utils/format';
import { Button } from '@mui/material';

const tabs: Array<{ label: string; value?: EventStatus }> = [
  { label: 'All' },
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Completed', value: 'completed' },
];

export function AdminEventsPage() {
  const collegeSlug = useCollegeSlug();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [statusFilter, setStatusFilter] = useState<EventStatus | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const result = await listEvents(collegeSlug, {
          limit: 50,
          status: statusFilter,
        });
        if (!cancelled) setEvents(result.items);
      } catch {
        if (!cancelled) setError('Could not load campus events.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [collegeSlug, statusFilter]);

  const activeTab = tabs.findIndex((tab) => tab.value === statusFilter);

  return (
    <Stack spacing={3}>
      <PageHeader title="Campus events" subtitle="All events across college clubs" />

      <Tabs
        value={activeTab === -1 ? 0 : activeTab}
        onChange={(_, index) => setStatusFilter(tabs[index]?.value)}
      >
        {tabs.map((tab) => (
          <Tab key={tab.label} label={tab.label} />
        ))}
      </Tabs>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {loading ? (
        <LoadingBox />
      ) : events.length ? (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Event</TableCell>
                <TableCell>Club</TableCell>
                <TableCell>When</TableCell>
                <TableCell>Registrations</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">View</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id} hover>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>{event.clubName ?? '—'}</TableCell>
                  <TableCell>{formatDateTime(event.startAt)}</TableCell>
                  <TableCell>{event.registrationCount}</TableCell>
                  <TableCell>
                    <EventStatusChip status={event.status} />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      component={RouterLink}
                      to={`/dashboard/events/${event.slug}`}
                      size="small"
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <EmptyState title="No events found" description="Try a different status filter." />
      )}
    </Stack>
  );
}
