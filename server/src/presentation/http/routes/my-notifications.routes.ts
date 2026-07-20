import { Router } from 'express';
import { notificationController } from './notification.container';
import { authenticate } from '../middleware/authenticate.middleware';
import { requirePermissions } from '../middleware/authorize.middleware';
import { resolveTenant } from '../middleware/tenant.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  notificationIdParamSchema,
  listNotificationsQuerySchema,
} from '../dto/notification.dto';

const router = Router({ mergeParams: true });

/**
 * User notification inbox:
 * /colleges/:collegeSlug/users/me/notifications/...
 */
router.use(authenticate, resolveTenant);

router.get(
  '/',
  validate({ query: listNotificationsQuerySchema }),
  requirePermissions('notifications:read'),
  notificationController.list,
);

router.get(
  '/unread-count',
  requirePermissions('notifications:read'),
  notificationController.unreadCount,
);

router.post(
  '/mark-all-read',
  requirePermissions('notifications:update'),
  notificationController.markAllRead,
);

router.patch(
  '/:notificationId/read',
  validate({ params: notificationIdParamSchema }),
  requirePermissions('notifications:update'),
  notificationController.markRead,
);

router.delete(
  '/:notificationId',
  validate({ params: notificationIdParamSchema }),
  requirePermissions('notifications:update'),
  notificationController.delete,
);

export default router;
