import { Router } from 'express';
import authRoutes from './auth.routes';

const apiV1Router = Router();

apiV1Router.use('/auth', authRoutes);

export default apiV1Router;
