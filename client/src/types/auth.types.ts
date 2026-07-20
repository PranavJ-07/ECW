export type UserRole = 'student' | 'college_admin' | 'faculty';
export type PlatformRole = 'platform_admin';

export interface PublicUser {
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
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollegeSummary {
  id: string;
  name: string;
  slug: string;
}

export interface AuthSession {
  accessToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface LoginCredentials {
  email: string;
  password: string;
  collegeSlug: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  collegeSlug: string;
  department?: string;
  academicYear?: number;
  studentId?: string;
}

export interface CurrentUserPayload {
  user: PublicUser;
  permissions: string[];
  college: CollegeSummary;
}
