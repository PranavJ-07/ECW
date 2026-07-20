import type { UserRole } from '@/types/auth.types';
import { isCollegeAdmin, isFaculty, isFacultyOnly, isStudent, hasPermission } from '@/utils/roles';

export type NavIconKey =
  | 'overview'
  | 'events'
  | 'my-events'
  | 'certificates'
  | 'notifications'
  | 'analytics'
  | 'clubs'
  | 'advised'
  | 'directory';

export interface NavItem {
  label: string;
  path: string;
  icon: NavIconKey;
  permission?: string;
  end?: boolean;
  officerOnly?: boolean;
}

export const studentNavItems: NavItem[] = [
  { label: 'Overview', path: '/dashboard', icon: 'overview', end: true },
  { label: 'Browse events', path: '/dashboard/events', icon: 'events', permission: 'events:read' },
  {
    label: 'My events',
    path: '/dashboard/my-events',
    icon: 'my-events',
    permission: 'events:register',
  },
  {
    label: 'Certificates',
    path: '/dashboard/certificates',
    icon: 'certificates',
    permission: 'certificates:read',
  },
  {
    label: 'Notifications',
    path: '/dashboard/notifications',
    icon: 'notifications',
    permission: 'notifications:read',
  },
  {
    label: 'Club dashboard',
    path: '/dashboard/clubs',
    icon: 'clubs',
    officerOnly: true,
  },
];

export const facultyNavItems: NavItem[] = [
  { label: 'Overview', path: '/dashboard', icon: 'overview', end: true },
  { label: 'Campus events', path: '/dashboard/events', icon: 'events', permission: 'events:read' },
  {
    label: 'Browse clubs',
    path: '/dashboard/browse-clubs',
    icon: 'directory',
    permission: 'clubs:read',
  },
  {
    label: 'Advised clubs',
    path: '/dashboard/advised-clubs',
    icon: 'advised',
    permission: 'clubs:read',
  },
  {
    label: 'Notifications',
    path: '/dashboard/notifications',
    icon: 'notifications',
    permission: 'notifications:read',
  },
];

export const adminPrimaryNavItems: NavItem[] = [
  { label: 'Overview', path: '/dashboard', icon: 'overview', end: true },
  {
    label: 'Analytics',
    path: '/dashboard/analytics',
    icon: 'analytics',
    permission: 'analytics:read',
  },
  {
    label: 'Manage clubs',
    path: '/dashboard/admin/clubs',
    icon: 'clubs',
    permission: 'clubs:read',
  },
  {
    label: 'Campus events',
    path: '/dashboard/admin/events',
    icon: 'events',
    permission: 'events:read',
  },
  {
    label: 'Notifications',
    path: '/dashboard/notifications',
    icon: 'notifications',
    permission: 'notifications:read',
  },
];

export const facultyExtraNavItems: NavItem[] = [
  {
    label: 'Advised clubs',
    path: '/dashboard/advised-clubs',
    icon: 'advised',
    permission: 'clubs:read',
  },
];

export const adminStudentExtras: NavItem[] = [
  {
    label: 'My events',
    path: '/dashboard/my-events',
    icon: 'my-events',
    permission: 'events:register',
  },
  {
    label: 'Certificates',
    path: '/dashboard/certificates',
    icon: 'certificates',
    permission: 'certificates:read',
  },
];

function filterNavItems(items: NavItem[], permissions: string[], isOfficer: boolean): NavItem[] {
  return items.filter((item) => {
    if (item.officerOnly && !isOfficer) return false;
    if (item.permission && !hasPermission(permissions, item.permission)) return false;
    return true;
  });
}

function mergeUniqueNavItems(base: NavItem[], extras: NavItem[]): NavItem[] {
  const merged = [...base];
  for (const item of extras) {
    if (!merged.some((existing) => existing.path === item.path)) {
      merged.push(item);
    }
  }
  return merged;
}

export function getVisibleNavItems(
  roles: UserRole[],
  permissions: string[],
  isOfficer: boolean,
): NavItem[] {
  if (isCollegeAdmin(roles)) {
    let items = filterNavItems(adminPrimaryNavItems, permissions, isOfficer);

    if (isOfficer) {
      items = mergeUniqueNavItems(items, [
        { label: 'Club dashboard', path: '/dashboard/clubs', icon: 'clubs', officerOnly: true },
      ]);
    }

    if (isStudent(roles)) {
      items = mergeUniqueNavItems(
        items,
        filterNavItems(adminStudentExtras, permissions, isOfficer),
      );
    }

    return items;
  }

  if (isFacultyOnly(roles)) {
    return filterNavItems(facultyNavItems, permissions, isOfficer);
  }

  const items = filterNavItems(studentNavItems, permissions, isOfficer);

  if (isFaculty(roles)) {
    return mergeUniqueNavItems(
      items,
      filterNavItems(facultyExtraNavItems, permissions, isOfficer),
    );
  }

  return items;
}

export const pageTitles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/events': 'Campus events',
  '/dashboard/my-events': 'My events',
  '/dashboard/certificates': 'Certificates',
  '/dashboard/notifications': 'Notifications',
  '/dashboard/clubs': 'Club dashboard',
  '/dashboard/browse-clubs': 'Browse clubs',
  '/dashboard/advised-clubs': 'Advised clubs',
  '/dashboard/analytics': 'College analytics',
  '/dashboard/admin/clubs': 'Manage clubs',
  '/dashboard/admin/events': 'Campus events',
};

export function resolvePageTitle(pathname: string): string {
  if (pathname.startsWith('/dashboard/events/') && !pathname.includes('/manage')) {
    return 'Event details';
  }

  if (pathname.startsWith('/dashboard/browse-clubs/')) {
    return 'Club details';
  }

  if (pathname.startsWith('/dashboard/advised-clubs/')) {
    return 'Advised club';
  }

  if (pathname.startsWith('/dashboard/admin/clubs/')) {
    return 'Club analytics';
  }

  if (pathname.startsWith('/dashboard/clubs/')) {
    if (pathname.endsWith('/events/new')) return 'Create event';
    if (pathname.includes('/manage')) return 'Manage event';
    if (pathname.endsWith('/events')) return 'Club events';
    if (pathname.endsWith('/budget')) return 'Club budget';
    if (/^\/dashboard\/clubs\/[^/]+$/.test(pathname)) return 'Club overview';
    return 'Club dashboard';
  }

  return pageTitles[pathname] ?? 'Dashboard';
}
