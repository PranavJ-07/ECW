import { PlatformRole, UserRole } from '../../domain/enums/user-role.enum';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      authUser?: {
        userId: string;
        collegeId: string;
        email: string;
        roles: UserRole[];
        platformRole: PlatformRole | null;
        emailVerified: boolean;
        permissions: string[];
      };
    }
  }
}

export {};
