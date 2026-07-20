import type { UserRole } from '@/types/auth.types';

export function isCollegeAdmin(roles: UserRole[]): boolean {
  return roles.includes('college_admin');
}

export function isFaculty(roles: UserRole[]): boolean {
  return roles.includes('faculty');
}

export function isStudent(roles: UserRole[]): boolean {
  return roles.includes('student');
}

/** Faculty without student or admin roles — gets the faculty dashboard shell. */
export function isFacultyOnly(roles: UserRole[]): boolean {
  return isFaculty(roles) && !isStudent(roles) && !isCollegeAdmin(roles);
}

export function hasPermission(permissions: string[], permission: string): boolean {
  return permissions.includes(permission);
}

export type DashboardPersona = 'student' | 'faculty' | 'admin';

export function resolveDashboardPersona(roles: UserRole[]): DashboardPersona {
  if (isCollegeAdmin(roles)) return 'admin';
  if (isFacultyOnly(roles)) return 'faculty';
  return 'student';
}
