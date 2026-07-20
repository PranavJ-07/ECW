import {
  Alert,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  InputAdornment,
  Pagination,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { listClubs } from '@/api/clubs.api';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingBox } from '@/components/common/LoadingBox';
import { PageHeader } from '@/components/common/PageHeader';
import { useCollegeSlug } from '@/hooks/useCollegeSlug';
import type { ClubSummary } from '@/types/club.types';

export function BrowseClubsPage() {
  const collegeSlug = useCollegeSlug();
  const [clubs, setClubs] = useState<ClubSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const result = await listClubs(collegeSlug, { page, limit: 9, search: search || undefined });
        if (!cancelled) {
          setClubs(result.items);
          setTotalPages(result.meta.totalPages);
        }
      } catch {
        if (!cancelled) setError('Could not load clubs.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [collegeSlug, page, search]);

  return (
    <Stack spacing={3}>
      <PageHeader title="Browse clubs" subtitle="Active clubs at your college" />

      <TextField
        placeholder="Search clubs…"
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
      ) : clubs.length ? (
        <>
          <Grid container spacing={2}>
            {clubs.map((club) => (
              <Grid key={club.id} size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: '100%' }}>
                  <CardActionArea
                    component={RouterLink}
                    to={`/dashboard/browse-clubs/${club.slug}`}
                    sx={{ height: '100%' }}
                  >
                    <CardContent>
                      <Stack spacing={1}>
                        <Typography variant="h6">{club.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {club.memberCount} members
                        </Typography>
                        <Chip size="small" label={club.category} variant="outlined" sx={{ alignSelf: 'flex-start' }} />
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
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
        <EmptyState title="No clubs found" description="Try a different search term." />
      )}
    </Stack>
  );
}
