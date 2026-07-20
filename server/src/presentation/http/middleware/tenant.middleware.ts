import { Request, Response, NextFunction } from 'express';
import { NotFoundError, ForbiddenError } from '../../../domain/errors';
import { collegeRepository } from '../../../infrastructure/database/repositories/college.repository';

declare global {
  namespace Express {
    interface Request {
      tenant?: {
        collegeId: string;
        collegeSlug: string;
      };
    }
  }
}

/**
 * Resolves :collegeSlug to a tenant context on req.tenant.
 * Ensures authenticated users can only access their own college's data.
 */
export async function resolveTenant(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const collegeSlug = String(req.params.collegeSlug);

    if (!collegeSlug) {
      next(new NotFoundError('College slug is required', 'COLLEGE_NOT_FOUND'));
      return;
    }

    const college = await collegeRepository.findBySlug(collegeSlug);

    if (!college || !college.isActive) {
      next(new NotFoundError('College not found', 'COLLEGE_NOT_FOUND'));
      return;
    }

    if (req.authUser && req.authUser.collegeId !== college.id) {
      next(new ForbiddenError('Access denied for this college', 'TENANT_MISMATCH'));
      return;
    }

    req.tenant = {
      collegeId: college.id,
      collegeSlug: college.slug,
    };

    next();
  } catch (error) {
    next(error);
  }
}
