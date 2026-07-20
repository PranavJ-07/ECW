import { Router } from 'express';
import authRoutes from './auth.routes';
import clubRoutes from './club.routes';
import eventRoutes from './event.routes';
import clubEventRoutes from './club-event.routes';
import registrationRoutes from './registration.routes';
import myRegistrationsRoutes from './my-registrations.routes';
import attendanceRoutes from './attendance.routes';
import certificateRoutes from './certificate.routes';
import myCertificatesRoutes from './my-certificates.routes';
import certificateVerifyRoutes from './certificate-verify.routes';
import budgetRoutes from './budget.routes';
import myNotificationsRoutes from './my-notifications.routes';
import {
  collegeAnalyticsRoutes,
  clubAnalyticsRoutes,
  eventAnalyticsRoutes,
} from './analytics.routes';

const apiV1Router = Router();

apiV1Router.use('/auth', authRoutes);

apiV1Router.use('/certificates', certificateVerifyRoutes);

apiV1Router.use('/colleges/:collegeSlug/analytics', collegeAnalyticsRoutes);
apiV1Router.use('/colleges/:collegeSlug/clubs/:clubSlug/budgets', budgetRoutes);
apiV1Router.use('/colleges/:collegeSlug/clubs/:clubSlug/analytics', clubAnalyticsRoutes);
apiV1Router.use('/colleges/:collegeSlug/clubs', clubRoutes);
apiV1Router.use('/colleges/:collegeSlug/clubs/:clubSlug/events', clubEventRoutes);
apiV1Router.use('/colleges/:collegeSlug/events/:eventSlug/attendance', attendanceRoutes);
apiV1Router.use('/colleges/:collegeSlug/events/:eventSlug/analytics', eventAnalyticsRoutes);
apiV1Router.use('/colleges/:collegeSlug/events/:eventSlug/certificates', certificateRoutes);
apiV1Router.use('/colleges/:collegeSlug/events/:eventSlug', registrationRoutes);
apiV1Router.use('/colleges/:collegeSlug/events', eventRoutes);
apiV1Router.use('/colleges/:collegeSlug/users/me', myNotificationsRoutes);
apiV1Router.use('/colleges/:collegeSlug/users/me', myRegistrationsRoutes);
apiV1Router.use('/colleges/:collegeSlug/users/me', myCertificatesRoutes);

export default apiV1Router;
