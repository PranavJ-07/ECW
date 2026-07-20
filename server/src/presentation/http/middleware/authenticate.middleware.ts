import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../../../domain/errors';
import { authTokenService } from '../../../application/auth/services/auth-token.service';
import { permissionService } from '../../../application/auth/services/permission.service';
import { userRepository } from '../../../infrastructure/database/repositories/user.repository';
import { AccountDeactivatedError } from '../../../domain/errors/auth.errors';

/**
 * Verifies JWT access token and attaches authenticated user to the request.
 * Must be applied before any role/permission middleware.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token required', 'UNAUTHORIZED');
    }

    const token = authHeader.slice(7);
    const payload = authTokenService.verifyAccessToken(token);

    const user = await userRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedError('User not found', 'UNAUTHORIZED');
    }

    if (!user.isActive) {
      throw new AccountDeactivatedError();
    }

    // Invalidate tokens issued before password change
    if (user.passwordChangedAt && payload.iat) {
      const passwordChangedAtSeconds = Math.floor(user.passwordChangedAt.getTime() / 1000);
      if (payload.iat < passwordChangedAtSeconds) {
        throw new UnauthorizedError('Token expired due to password change', 'TOKEN_INVALID');
      }
    }

    const permissions = permissionService.resolvePermissions(user.roles, user.platformRole);

    req.authUser = {
      userId: user.id,
      collegeId: user.collegeId,
      email: user.email,
      roles: user.roles,
      platformRole: user.platformRole,
      emailVerified: user.emailVerified,
      permissions,
    };

    next();
  } catch (error) {
    next(error);
  }
}
