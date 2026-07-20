import { Router } from 'express';
import { certificateController } from './certificate.container';
import { validate } from '../middleware/validate.middleware';
import { verifyCertificateParamSchema } from '../dto/certificate.dto';

const router = Router();

/**
 * Public certificate verification — no authentication required.
 * GET /api/v1/certificates/verify/:verificationCode
 */
router.get(
  '/verify/:verificationCode',
  validate({ params: verifyCertificateParamSchema }),
  certificateController.verify,
);

export default router;
