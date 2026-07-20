import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  /** Optional permission gate — requires at least one listed permission. */
  permissions?: string[];
}

export function ProtectedRoute({ permissions }: ProtectedRouteProps) {
  const { isAuthenticated, isInitializing, permissions: userPermissions } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (permissions?.length) {
    const allowed = permissions.some((permission) => userPermissions.includes(permission));

    if (!allowed) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}
