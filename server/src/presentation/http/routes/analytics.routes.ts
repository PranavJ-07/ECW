import { Router } from 'express';
import { analyticsController } from './analytics.container';
import { authenticate } from '../middleware/authenticate.middleware';
import { requirePermissions } from '../middleware/authorize.middleware';
import { resolveTenant } from '../middleware/tenant.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  collegeSlugParamSchema,
  clubSlugParamSchema,
  eventSlugParamSchema,
  analyticsDateRangeQuerySchema,
} from '../dto/analytics.dto';

const collegeRouter = Router({ mergeParams: true });
const clubRouter = Router({ mergeParams: true });
const eventRouter = Router({ mergeParams: true });

collegeRouter.use(authenticate, resolveTenant);

collegeRouter.get(
  '/overview',
  validate({ params: collegeSlugParamSchema, query: analyticsDateRangeQuerySchema }),
  requirePermissions('analytics:read'),
  analyticsController.collegeOverview,
);

clubRouter.use(authenticate, resolveTenant);

clubRouter.get(
  '/',
  validate({ params: clubSlugParamSchema, query: analyticsDateRangeQuerySchema }),
  analyticsController.clubAnalytics,
);

eventRouter.use(authenticate, resolveTenant);

eventRouter.get(
  '/',
  validate({ params: eventSlugParamSchema }),
  analyticsController.eventAnalytics,
);

export { collegeRouter as collegeAnalyticsRoutes, clubRouter as clubAnalyticsRoutes, eventRouter as eventAnalyticsRoutes };
