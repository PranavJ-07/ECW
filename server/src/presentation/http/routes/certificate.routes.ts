import { Router } from 'express';
import { certificateController } from './certificate.container';
import { authenticate } from '../middleware/authenticate.middleware';
import { resolveTenant } from '../middleware/tenant.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  eventSlugParamSchema,
  eventCertificateIdParamSchema,
  issueCertificatesSchema,
  revokeCertificateSchema,
  listCertificatesQuerySchema,
} from '../dto/certificate.dto';

const router = Router({ mergeParams: true });

/**
 * Event-scoped certificate routes:
 * /colleges/:collegeSlug/events/:eventSlug/certificates/...
 */
router.use(authenticate, resolveTenant);

router.post(
  '/issue',
  validate({ params: eventSlugParamSchema, body: issueCertificatesSchema }),
  certificateController.issue,
);

router.get(
  '/',
  validate({ params: eventSlugParamSchema, query: listCertificatesQuerySchema }),
  certificateController.listByEvent,
);

router.post(
  '/:certificateId/revoke',
  validate({
    params: eventCertificateIdParamSchema,
    body: revokeCertificateSchema,
  }),
  certificateController.revoke,
);

export default router;
