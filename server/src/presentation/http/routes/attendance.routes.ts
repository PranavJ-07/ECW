import { Router } from 'express';
import { attendanceController } from './attendance.container';
import { authenticate } from '../middleware/authenticate.middleware';
import { requirePermissions } from '../middleware/authorize.middleware';
import { resolveTenant } from '../middleware/tenant.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  eventSlugParamSchema,
  scanAttendanceQrSchema,
  listAttendanceQuerySchema,
} from '../dto/attendance.dto';

const router = Router({ mergeParams: true });

/**
 * Event-scoped QR attendance routes:
 * /colleges/:collegeSlug/events/:eventSlug/attendance/...
 */
router.use(authenticate, resolveTenant);

router.get(
  '/qr',
  validate({ params: eventSlugParamSchema }),
  requirePermissions('events:register'),
  attendanceController.generateQr,
);

router.post(
  '/scan',
  validate({ params: eventSlugParamSchema, body: scanAttendanceQrSchema }),
  attendanceController.scanQr,
);

router.get(
  '/',
  validate({ params: eventSlugParamSchema, query: listAttendanceQuerySchema }),
  attendanceController.listCheckIns,
);

export default router;
