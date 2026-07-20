import { Router } from 'express';
import { registrationController } from './registration.container';
import { authenticate } from '../middleware/authenticate.middleware';
import { requirePermissions } from '../middleware/authorize.middleware';
import { resolveTenant } from '../middleware/tenant.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  eventSlugParamSchema,
  registerForEventSchema,
  checkInSchema,
  listRegistrationsQuerySchema,
} from '../dto/registration.dto';

const router = Router({ mergeParams: true });

/**
 * Event-scoped registration routes: /colleges/:collegeSlug/events/:eventSlug/...
 */
router.use(authenticate, resolveTenant);

router.post(
  '/register',
  validate({ params: eventSlugParamSchema, body: registerForEventSchema }),
  requirePermissions('events:register'),
  registrationController.register,
);

router.delete(
  '/register',
  validate({ params: eventSlugParamSchema }),
  requirePermissions('events:register'),
  registrationController.cancel,
);

router.get(
  '/registrations',
  validate({ params: eventSlugParamSchema, query: listRegistrationsQuerySchema }),
  registrationController.listByEvent,
);

router.post(
  '/check-in',
  validate({ params: eventSlugParamSchema, body: checkInSchema }),
  registrationController.checkIn,
);

export default router;
