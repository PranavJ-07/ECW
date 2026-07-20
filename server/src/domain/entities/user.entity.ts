import { PlatformRole, UserRole } from '../enums/user-role.enum';

export interface User {
  id: string;
  collegeId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  platformRole: PlatformRole | null;
  emailVerified: boolean;
  isActive: boolean;
  department?: string;
  academicYear?: number;
  studentId?: string;
  failedLoginAttempts: number;
  lockUntil: Date | null;
  lastLoginAt: Date | null;
  passwordChangedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Safe user shape — never includes passwordHash */
export type PublicUser = Omit<User, 'failedLoginAttempts' | 'lockUntil' | 'passwordChangedAt'>;
