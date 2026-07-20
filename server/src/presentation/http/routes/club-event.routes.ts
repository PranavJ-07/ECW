import { Router } from 'express';
import { eventController } from './event.container';
import { authenticate } from '../middleware/authenticate.middleware';
import { resolveTenant } from '../middleware/tenant.middleware';
import { validate } from '../middleware/validate.middleware';
import { clubEventParamSchema, createEventSchema } from '../dto/event.dto';

const router = Router({ mergeParams: true });

/**
 * Nested under clubs: POST /colleges/:collegeSlug/clubs/:clubSlug/events
 */
router.post(
  '/',
  authenticate,
  resolveTenant,
  validate({ params: clubEventParamSchema, body: createEventSchema }),
  eventController.create,
);

export default router;
