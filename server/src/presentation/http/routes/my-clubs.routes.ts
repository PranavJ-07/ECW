import { Router } from 'express';
import { membershipController } from './membership.container';
import { authenticate } from '../middleware/authenticate.middleware';
import { resolveTenant } from '../middleware/tenant.middleware';
import { validate } from '../middleware/validate.middleware';
import { myClubsQuerySchema } from '../dto/membership.dto';

const router = Router({ mergeParams: true });

/**
 * GET /colleges/:collegeSlug/users/me/clubs
 */
router.get(
  '/clubs',
  authenticate,
  resolveTenant,
  validate({ query: myClubsQuerySchema }),
  membershipController.myClubs,
);

router.get(
  '/advised-clubs',
  authenticate,
  resolveTenant,
  membershipController.myAdvisedClubs,
);

export default router;
