import { Router } from 'express';
import authRoutes from './auth.routes';
import clubRoutes from './club.routes';

const apiV1Router = Router();

apiV1Router.use('/auth', authRoutes);

// Tenant-scoped routes: /api/v1/colleges/:collegeSlug/clubs
apiV1Router.use('/colleges/:collegeSlug/clubs', clubRoutes);

export default apiV1Router;
