import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../../../domain/errors';
import { PlatformRole, UserRole } from '../../../domain/enums/user-role.enum';

/**
 * Requires the user to have at least one of the specified college-level roles.
 */
export function requireRoles(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      next(new UnauthorizedError());
      return;
    }

    const hasRole = roles.some((role) => req.authUser!.roles.includes(role));

    if (!hasRole) {
      next(new ForbiddenError('Insufficient role privileges', 'FORBIDDEN'));
      return;
    }

    next();
  };
}

/**
 * Requires the user to have at least one of the specified permissions.
 * Permissions are resolved from roles at login / authenticate time.
 */
export function requirePermissions(...permissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      next(new UnauthorizedError());
      return;
    }

    const hasPermission = permissions.some((p) => req.authUser!.permissions.includes(p));

    if (!hasPermission) {
      next(new ForbiddenError('Insufficient permissions', 'FORBIDDEN'));
      return;
    }

    next();
  };
}

/** Shorthand for college admin routes */
export const requireCollegeAdmin = requireRoles(UserRole.COLLEGE_ADMIN);

/** Shorthand for platform admin routes */
export function requirePlatformAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.authUser) {
    next(new UnauthorizedError());
    return;
  }

  if (req.authUser.platformRole !== PlatformRole.PLATFORM_ADMIN) {
    next(new ForbiddenError('Platform admin access required', 'FORBIDDEN'));
    return;
  }

  next();
}

/**
 * Blocks actions that require a verified email address.
 */
export function requireVerifiedEmail(req: Request, _res: Response, next: NextFunction): void {
  if (!req.authUser) {
    next(new UnauthorizedError());
    return;
  }

  if (!req.authUser.emailVerified) {
    next(new ForbiddenError('Email verification required', 'EMAIL_NOT_VERIFIED'));
    return;
  }

  next();
}
