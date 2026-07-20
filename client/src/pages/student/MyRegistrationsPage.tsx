import { Alert, Pagination, Stack, Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';
import { listMyRegistrations } from '@/api/registrations.api';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingBox } from '@/components/common/LoadingBox';
import { PageHeader } from '@/components/common/PageHeader';
import { RegistrationTable } from '@/components/student/RegistrationTable';
import { useCollegeSlug } from '@/hooks/useCollegeSlug';
import type { RegistrationStatus, RegistrationWithEvent } from '@/types/registration.types';

const tabs: Array<{ label: string; value?: RegistrationStatus }> = [
  { label: 'All' },
  { label: 'Registered', value: 'registered' },
  { label: 'Waitlisted', value: 'waitlisted' },
  { label: 'Attended', value: 'attended' },
  { label: 'Cancelled', value: 'cancelled' },
];

export function MyRegistrationsPage() {
  const collegeSlug = useCollegeSlug();
  const [registrations, setRegistrations] = useState<RegistrationWithEvent[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRegistrations(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const result = await listMyRegistrations(collegeSlug, {
          page,
          limit: 10,
          status: statusFilter,
        });

        if (cancelled) return;

        setRegistrations(result.items);
        setTotalPages(result.meta.totalPages);
      } catch {
        if (!cancelled) {
          setError('Could not load your registrations.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadRegistrations();

    return () => {
      cancelled = true;
    };
  }, [collegeSlug, page, statusFilter]);

  const activeTab = tabs.findIndex((tab) => tab.value === statusFilter);

  return (
    <Stack spacing={3}>
      <PageHeader
        title="My events"
        subtitle="Track registrations, waitlist status, and attendance"
      />

      <Tabs
        value={activeTab === -1 ? 0 : activeTab}
        onChange={(_, index) => {
          setPage(1);
          setStatusFilter(tabs[index]?.value);
        }}
      >
        {tabs.map((tab) => (
          <Tab key={tab.label} label={tab.label} />
        ))}
      </Tabs>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {loading ? (
        <LoadingBox />
      ) : registrations.length ? (
        <>
          <RegistrationTable registrations={registrations} />
          {totalPages > 1 ? (
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              sx={{ alignSelf: 'center' }}
            />
          ) : null}
        </>
      ) : (
        <EmptyState
          title="No registrations"
          description="Browse events and register to build your schedule."
        />
      )}
    </Stack>
  );
}
