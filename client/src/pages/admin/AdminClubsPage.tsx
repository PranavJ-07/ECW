import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { isAxiosError } from 'axios';
import { useEffect, useState, type FormEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { createClub, listClubs } from '@/api/clubs.api';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingBox } from '@/components/common/LoadingBox';
import { PageHeader } from '@/components/common/PageHeader';
import { useCollegeSlug } from '@/hooks/useCollegeSlug';
import type { ClubCategory, ClubSummary } from '@/types/club.types';
import { slugify } from '@/utils/money';
import { hasPermission } from '@/utils/roles';
import { useAuth } from '@/context/AuthContext';

const categories: ClubCategory[] = ['tech', 'cultural', 'sports', 'literary', 'social', 'other'];

export function AdminClubsPage() {
  const collegeSlug = useCollegeSlug();
  const { permissions } = useAuth();
  const canCreate = hasPermission(permissions, 'clubs:create');
  const [clubs, setClubs] = useState<ClubSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'tech' as ClubCategory,
    contactEmail: '',
  });

  const loadClubs = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await listClubs(collegeSlug, { limit: 50 });
      setClubs(result.items);
    } catch {
      setError('Could not load clubs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadClubs();
  }, [collegeSlug]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      await createClub(collegeSlug, {
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description || undefined,
        category: form.category,
        contactEmail: form.contactEmail || undefined,
        visibility: 'college_only',
      });
      setDialogOpen(false);
      setForm({ name: '', slug: '', description: '', category: 'tech', contactEmail: '' });
      await loadClubs();
    } catch (err) {
      const message = isAxiosError(err)
        ? ((err.response?.data as { error?: { message?: string } })?.error?.message ??
          'Could not create club')
        : 'Could not create club';
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Manage clubs"
        subtitle="Create and monitor college clubs"
        action={
          canCreate ? (
            <Button variant="contained" onClick={() => setDialogOpen(true)}>
              Create club
            </Button>
          ) : undefined
        }
      />

      {error ? <Alert severity="error">{error}</Alert> : null}

      {loading ? (
        <LoadingBox />
      ) : clubs.length ? (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Members</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clubs.map((club) => (
                <TableRow key={club.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {club.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{club.category}</TableCell>
                  <TableCell>{club.memberCount}</TableCell>
                  <TableCell>{club.status}</TableCell>
                  <TableCell align="right">
                    <Button
                      component={RouterLink}
                      to={`/dashboard/admin/clubs/${club.slug}`}
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
        <EmptyState
          title="No clubs yet"
          description="Create the first club for your college."
          action={
            canCreate ? (
              <Button variant="contained" onClick={() => setDialogOpen(true)}>
                Create club
              </Button>
            ) : undefined
          }
        />
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create club</DialogTitle>
        <Box component="form" onSubmit={handleCreate}>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {formError ? <Alert severity="error">{formError}</Alert> : null}
              <TextField
                label="Name"
                value={form.name}
                onChange={(event) =>
                  setForm({
                    ...form,
                    name: event.target.value,
                    slug: form.slug || slugify(event.target.value),
                  })
                }
                required
                fullWidth
              />
              <TextField
                label="Slug"
                value={form.slug}
                onChange={(event) => setForm({ ...form, slug: event.target.value })}
                required
                fullWidth
              />
              <TextField
                select
                label="Category"
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value as ClubCategory })
                }
                fullWidth
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Description"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                multiline
                minRows={2}
                fullWidth
              />
              <TextField
                label="Contact email"
                type="email"
                value={form.contactEmail}
                onChange={(event) => setForm({ ...form, contactEmail: event.target.value })}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  );
}