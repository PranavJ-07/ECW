import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type ValidationSchemas = {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
};

/** Express 5 exposes query/params as read-only getters — merge instead of reassigning. */
function mergeParsed(target: Record<string, unknown>, parsed: Record<string, unknown>): void {
  for (const key of Object.keys(target)) {
    if (!(key in parsed)) {
      delete target[key];
    }
  }

  Object.assign(target, parsed);
}

/**
 * Generic Zod validation middleware.
 * Parses and replaces req.body / query / params with validated data.
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        mergeParsed(
          req.query as Record<string, unknown>,
          schemas.query.parse(req.query) as Record<string, unknown>,
        );
      }
      if (schemas.params) {
        mergeParsed(
          req.params as Record<string, unknown>,
          schemas.params.parse(req.params) as Record<string, unknown>,
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
