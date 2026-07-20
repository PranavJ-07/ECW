import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../../domain/errors';
import { env } from '../../../config';
import { logger } from '../../../infrastructure/logger';

/**
 * Central error handler — the last middleware in the chain.
 * Maps known errors to consistent JSON responses.
 * Never leaks stack traces in production.
 */
export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // ── Zod validation errors ──────────────────────────────────
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
    return;
  }

  // ── Known application errors ─────────────────────────────
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error({ err, requestId: req.requestId }, 'Non-operational error');
    }

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
    return;
  }

  // ── Unknown / programmer errors ────────────────────────────
  logger.error({ err, requestId: req.requestId }, 'Unhandled error');

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
      ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
}
