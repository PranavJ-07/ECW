import { Router } from 'express';
import { certificateController } from './certificate.container';
import { authenticate } from '../middleware/authenticate.middleware';
import { requirePermissions } from '../middleware/authorize.middleware';
import { resolveTenant } from '../middleware/tenant.middleware';
import { validate } from '../middleware/validate.middleware';
import { certificateIdParamSchema, listCertificatesQuerySchema } from '../dto/certificate.dto';

const router = Router({ mergeParams: true });

/**
 * GET /colleges/:collegeSlug/users/me/certificates
 * GET /colleges/:collegeSlug/users/me/certificates/:certificateId
 */
router.get(
  '/certificates',
  authenticate,
  resolveTenant,
  validate({ query: listCertificatesQuerySchema }),
  requirePermissions('certificates:read'),
  certificateController.myCertificates,
);

router.get(
  '/certificates/:certificateId',
  authenticate,
  resolveTenant,
  validate({ params: certificateIdParamSchema }),
  requirePermissions('certificates:read'),
  certificateController.getMyCertificate,
);

export default router;
