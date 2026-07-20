import { Router } from 'express';
import { clubController } from './club.container';
import { authenticate } from '../middleware/authenticate.middleware';
import { requirePermissions } from '../middleware/authorize.middleware';
import { resolveTenant } from '../middleware/tenant.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  clubSlugParamSchema,
  createClubSchema,
  updateClubSchema,
  listClubsQuerySchema,
} from '../dto/club.dto';

const router = Router({ mergeParams: true });

/**
 * All club routes require authentication + tenant resolution.
 * Routes are mounted at /colleges/:collegeSlug/clubs
 */
router.use(authenticate, resolveTenant);

router.get(
  '/',
  validate({ query: listClubsQuerySchema }),
  requirePermissions('clubs:read'),
  clubController.list,
);

router.post(
  '/',
  validate({ body: createClubSchema }),
  requirePermissions('clubs:create'),
  clubController.create,
);

router.get(
  '/:clubSlug',
  validate({ params: clubSlugParamSchema }),
  requirePermissions('clubs:read'),
  clubController.getBySlug,
);

router.patch(
  '/:clubSlug',
  validate({ params: clubSlugParamSchema, body: updateClubSchema }),
  requirePermissions('clubs:update'),
  clubController.update,
);

router.delete(
  '/:clubSlug',
  validate({ params: clubSlugParamSchema }),
  requirePermissions('clubs:delete'),
  clubController.archive,
);

export default router;
