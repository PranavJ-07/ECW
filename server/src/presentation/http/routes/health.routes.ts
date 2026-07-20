import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

/**
 * GET /health
 * Used by load balancers, Docker, and CI to verify the API is alive.
 */
router.get('/', (_req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  const status = dbStatus === 'connected' ? 'healthy' : 'degraded';
  const statusCode = dbStatus === 'connected' ? 200 : 503;

  res.status(statusCode).json({
    success: statusCode === 200,
    data: {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: dbStatus,
      },
    },
  });
});

export default router;
