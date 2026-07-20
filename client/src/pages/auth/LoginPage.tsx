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
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { isAxiosError } from 'axios';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [collegeSlug, setCollegeSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password, collegeSlug });
      navigate(from, { replace: true });
    } catch (err) {
      const message = isAxiosError(err)
        ? ((err.response?.data as { error?: { message?: string } })?.error?.message ??
          'Login failed')
        : 'Login failed';
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
      }}
    >
      <Paper sx={{ width: '100%', maxWidth: 420, p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Sign in
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Access your college club and event dashboard.
            </Typography>
          </Box>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="College slug"
                value={collegeSlug}
                onChange={(event) => setCollegeSlug(event.target.value)}
                required
                fullWidth
                placeholder="mit"
              />
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                fullWidth
              />
              <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary">
            No account?{' '}
            <MuiLink component={Link} to="/register">
              Create one
            </MuiLink>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
