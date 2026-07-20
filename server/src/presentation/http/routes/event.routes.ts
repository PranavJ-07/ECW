import { Router } from 'express';
import { eventController } from './event.container';
import { authenticate } from '../middleware/authenticate.middleware';
import { requirePermissions } from '../middleware/authorize.middleware';
import { resolveTenant } from '../middleware/tenant.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  eventSlugParamSchema,
  updateEventSchema,
  cancelEventSchema,
  listEventsQuerySchema,
} from '../dto/event.dto';

const router = Router({ mergeParams: true });

/**
 * College-scoped event routes: /colleges/:collegeSlug/events
 * Write operations authorize in use cases (college_admin OR club officer).
 */
router.use(authenticate, resolveTenant);

router.get(
  '/',
  validate({ query: listEventsQuerySchema }),
  requirePermissions('events:read'),
  eventController.list,
);

router.get(
  '/:eventSlug',
  validate({ params: eventSlugParamSchema }),
  requirePermissions('events:read'),
  eventController.getBySlug,
);

router.patch(
  '/:eventSlug',
  validate({ params: eventSlugParamSchema, body: updateEventSchema }),
  eventController.update,
);

router.post(
  '/:eventSlug/publish',
  validate({ params: eventSlugParamSchema }),
  eventController.publish,
);

router.post(
  '/:eventSlug/cancel',
  validate({ params: eventSlugParamSchema, body: cancelEventSchema }),
  eventController.cancel,
);

router.delete(
  '/:eventSlug',
  validate({ params: eventSlugParamSchema }),
  eventController.remove,
);

export default router;
