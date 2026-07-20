import { PlatformRole, UserRole } from '../../../domain/enums/user-role.enum';

/**
 * Maps roles to fine-grained permissions.
 * Use cases and middleware check permissions, not raw role strings.
 */
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.STUDENT]: [
    'clubs:read',
    'events:read',
    'events:register',
    'certificates:read',
    'budgets:read',
    'expenses:create',
    'memberships:join',
    'announcements:read',
    'notifications:read',
    'notifications:update',
    'profile:read',
    'profile:update',
  ],
  [UserRole.COLLEGE_ADMIN]: [
    'clubs:read',
    'clubs:create',
    'clubs:update',
    'clubs:delete',
    'events:read',
    'events:create',
    'events:update',
    'events:register',
    'certificates:read',
    'certificates:issue',
    'certificates:revoke',
    'budgets:read',
    'budgets:manage',
    'expenses:create',
    'expenses:approve',
    'memberships:join',
    'members:approve',
    'announcements:read',
    'announcements:create',
    'notifications:read',
    'notifications:update',
    'users:read',
    'users:update',
    'audit:read',
    'analytics:read',
    'profile:read',
    'profile:update',
  ],
  [UserRole.FACULTY]: [
    'clubs:read',
    'events:read',
    'announcements:read',
    'notifications:read',
    'notifications:update',
    'profile:read',
    'profile:update',
  ],
};

const PLATFORM_PERMISSIONS: Record<PlatformRole, string[]> = {
  [PlatformRole.PLATFORM_ADMIN]: [
    'platform:colleges:create',
    'platform:colleges:read',
    'platform:colleges:update',
  ],
};

export class PermissionService {
  resolvePermissions(roles: UserRole[], platformRole: PlatformRole | null): string[] {
    const permissions = new Set<string>();

    for (const role of roles) {
      ROLE_PERMISSIONS[role]?.forEach((p) => permissions.add(p));
    }

    if (platformRole) {
      PLATFORM_PERMISSIONS[platformRole]?.forEach((p) => permissions.add(p));
    }

    return Array.from(permissions);
  }

  hasPermission(userPermissions: string[], required: string): boolean {
    return userPermissions.includes(required);
  }

  hasAnyPermission(userPermissions: string[], required: string[]): boolean {
    return required.some((p) => userPermissions.includes(p));
  }

  hasRole(userRoles: UserRole[], required: UserRole[]): boolean {
    return required.some((r) => userRoles.includes(r));
  }
}

export const permissionService = new PermissionService();
