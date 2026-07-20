import { Router } from 'express';
import authRoutes from './auth.routes';
import clubRoutes from './club.routes';
import eventRoutes from './event.routes';
import clubEventRoutes from './club-event.routes';
import registrationRoutes from './registration.routes';
import myRegistrationsRoutes from './my-registrations.routes';
import attendanceRoutes from './attendance.routes';

const apiV1Router = Router();

apiV1Router.use('/auth', authRoutes);

apiV1Router.use('/colleges/:collegeSlug/clubs', clubRoutes);
apiV1Router.use('/colleges/:collegeSlug/clubs/:clubSlug/events', clubEventRoutes);
apiV1Router.use('/colleges/:collegeSlug/events/:eventSlug/attendance', attendanceRoutes);
apiV1Router.use('/colleges/:collegeSlug/events/:eventSlug', registrationRoutes);
apiV1Router.use('/colleges/:collegeSlug/events', eventRoutes);
apiV1Router.use('/colleges/:collegeSlug/users/me', myRegistrationsRoutes);

export default apiV1Router;
