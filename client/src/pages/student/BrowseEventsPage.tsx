import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import {
  Alert,
  Grid,
  InputAdornment,
  Pagination,
  Stack,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { listEvents } from '@/api/events.api';
import { EmptyState } from '@/components/common/EmptyState';
import { EventCard } from '@/components/student/EventCard';
import { LoadingBox } from '@/components/common/LoadingBox';
import { PageHeader } from '@/components/common/PageHeader';
import { useCollegeSlug } from '@/hooks/useCollegeSlug';
import type { EventSummary } from '@/types/event.types';
import { isUpcoming } from '@/utils/format';

export function BrowseEventsPage() {
  const collegeSlug = useCollegeSlug();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const result = await listEvents(collegeSlug, {
          status: 'published',
          page,
          limit: 9,
          search: search || undefined,
        });

        if (cancelled) return;

        setEvents(result.items.filter((event) => isUpcoming(event.endAt)));
        setTotalPages(result.meta.totalPages);
      } catch {
        if (!cancelled) {
          setError('Could not load events.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadEvents();

    return () => {
      cancelled = true;
    };
  }, [collegeSlug, page, search]);

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Browse events"
        subtitle="Discover and register for campus events"
      />

      <TextField
        placeholder="Search events…"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            setPage(1);
            setSearch(searchInput.trim());
          }
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
        sx={{ maxWidth: 420 }}
      />

      {error ? <Alert severity="error">{error}</Alert> : null}

      {loading ? (
        <LoadingBox />
      ) : events.length ? (
        <>
          <Grid container spacing={2}>
            {events.map((event) => (
              <Grid key={event.id} size={{ xs: 12, md: 4 }}>
                <EventCard
                  event={event}
                  actionLabel="View & register"
                  actionTo={`/dashboard/events/${event.slug}`}
                />
              </Grid>
            ))}
          </Grid>

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
          title="No events found"
          description={search ? 'Try a different search term.' : 'No published events are available right now.'}
        />
      )}
    </Stack>
  );
}
