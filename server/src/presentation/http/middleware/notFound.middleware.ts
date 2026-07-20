import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../../../domain/errors';

/**
 * Catches requests that don't match any registered route.
 * Must be registered AFTER all routes.
 */
export function notFoundMiddleware(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
}
