import { Router } from 'express';
import { registrationController } from './registration.container';
import { authenticate } from '../middleware/authenticate.middleware';
import { requirePermissions } from '../middleware/authorize.middleware';
import { resolveTenant } from '../middleware/tenant.middleware';
import { validate } from '../middleware/validate.middleware';
import { myRegistrationsQuerySchema } from '../dto/registration.dto';

const router = Router({ mergeParams: true });

/**
 * GET /colleges/:collegeSlug/users/me/registrations
 */
router.get(
  '/registrations',
  authenticate,
  resolveTenant,
  validate({ query: myRegistrationsQuerySchema }),
  requirePermissions('events:register'),
  registrationController.myRegistrations,
);

export default router;
