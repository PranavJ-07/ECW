import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

interface RequirePermissionProps {
  permissions: string[];
  children: ReactNode;
  fallbackTo?: string;
}

/** Gate a single page by permission without nesting route outlets. */
export function RequirePermission({
  permissions,
  children,
  fallbackTo = '/dashboard',
}: RequirePermissionProps) {
  const { permissions: userPermissions } = useAuth();
  const allowed = permissions.some((permission) => userPermissions.includes(permission));

  if (!allowed) {
    return <Navigate to={fallbackTo} replace />;
  }

  return <>{children}</>;
}
