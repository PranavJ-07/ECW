import {
  Alert,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
} from '@mui/material';
import { isAxiosError } from 'axios';
import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createClubEvent } from '@/api/events.api';
import { PageHeader } from '@/components/common/PageHeader';
import { useCollegeSlug } from '@/hooks/useCollegeSlug';
import { slugify } from '@/utils/money';

export function CreateClubEventPage() {
  const { clubSlug = '' } = useParams();
  const collegeSlug = useCollegeSlug();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    venueName: '',
    startAt: '',
    endAt: '',
    capacity: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const created = await createClubEvent(collegeSlug, clubSlug, {
        title: form.title,
        slug: form.slug || slugify(form.title),
        description: form.description || undefined,
        location: {
          mode: 'onsite',
          venueName: form.venueName,
        },
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        timezone: form.timezone,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        visibility: 'college_only',
      });

      navigate(`/dashboard/clubs/${clubSlug}/events/${created.slug}/manage`);
    } catch (err) {
      const message = isAxiosError(err)
        ? ((err.response?.data as { error?: { message?: string } })?.error?.message ??
          'Could not create event')
        : 'Could not create event';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader title="Create event" subtitle="New events start as drafts until published" />

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Paper sx={{ p: 3 }}>
        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          <TextField
            label="Title"
            value={form.title}
            onChange={(event) =>
              setForm({
                ...form,
                title: event.target.value,
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
            helperText="URL-friendly identifier, e.g. spring-hackathon"
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            multiline
            minRows={3}
            fullWidth
          />
          <TextField
            label="Venue"
            value={form.venueName}
            onChange={(event) => setForm({ ...form, venueName: event.target.value })}
            required
            fullWidth
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Start"
              type="datetime-local"
              value={form.startAt}
              onChange={(event) => setForm({ ...form, startAt: event.target.value })}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="End"
              type="datetime-local"
              value={form.endAt}
              onChange={(event) => setForm({ ...form, endAt: event.target.value })}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
          <TextField
            label="Capacity"
            type="number"
            value={form.capacity}
            onChange={(event) => setForm({ ...form, capacity: event.target.value })}
            fullWidth
          />
          <TextField
            select
            label="Timezone"
            value={form.timezone}
            onChange={(event) => setForm({ ...form, timezone: event.target.value })}
            fullWidth
          >
            <MenuItem value="America/New_York">America/New_York</MenuItem>
            <MenuItem value="America/Chicago">America/Chicago</MenuItem>
            <MenuItem value="America/Los_Angeles">America/Los_Angeles</MenuItem>
            <MenuItem value="Asia/Kolkata">Asia/Kolkata</MenuItem>
            <MenuItem value="UTC">UTC</MenuItem>
          </TextField>

          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create draft event'}
            </Button>
            <Button variant="outlined" onClick={() => navigate(`/dashboard/clubs/${clubSlug}/events`)}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
