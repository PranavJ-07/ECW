import {
  Alert,
  Box,
  Button,
  Link as MuiLink,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { registerRequest } from '@/api/auth.api';
import { useAuth } from '@/context/AuthContext';
import { isAxiosError } from 'axios';

export function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    collegeSlug: '',
  });
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const result = await registerRequest(form);
      setSuccess(result.message);
    } catch (err) {
      const message = isAxiosError(err)
        ? ((err.response?.data as { error?: { message?: string } })?.error?.message ??
          'Registration failed')
        : 'Registration failed';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
        py: 4,
      }}
    >
      <Paper sx={{ width: '100%', maxWidth: 480, p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Create account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join your college on EthiCraft.
            </Typography>
          </Box>

          {success ? <Alert severity="success">{success}</Alert> : null}
          {error ? <Alert severity="error">{error}</Alert> : null}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="College slug"
                value={form.collegeSlug}
                onChange={(event) => setForm({ ...form, collegeSlug: event.target.value })}
                required
                fullWidth
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="First name"
                  value={form.firstName}
                  onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                  required
                  fullWidth
                />
                <TextField
                  label="Last name"
                  value={form.lastName}
                  onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                  required
                  fullWidth
                />
              </Stack>
              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
                fullWidth
                helperText="Min 8 chars, upper, lower, and digit"
              />
              <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                {isSubmitting ? 'Creating…' : 'Create account'}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <MuiLink component={Link} to="/login">
              Sign in
            </MuiLink>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
