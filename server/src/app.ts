import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config';
import { logger } from './infrastructure/logger';
import { requestIdMiddleware } from './presentation/http/middleware/requestId.middleware';
import { notFoundMiddleware } from './presentation/http/middleware/notFound.middleware';
import { errorMiddleware } from './presentation/http/middleware/error.middleware';
import healthRoutes from './presentation/http/routes/health.routes';
import apiV1Router from './presentation/http/routes';

/**
 * Creates and configures the Express application.
 * Separated from server.ts so the app can be tested without listening on a port.
 */
export function createApp(): express.Application {
  const app = express();

  // ── Security ───────────────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    }),
  );

  // ── Request parsing ────────────────────────────────────────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // ── Observability ──────────────────────────────────────────
  app.use(requestIdMiddleware);
  app.use(
    pinoHttp({
      logger,
      customProps: (req) => ({ requestId: req.requestId }),
      autoLogging: {
        ignore: (req) => req.url === '/health',
      },
    }),
  );

  // ── Routes ─────────────────────────────────────────────────
  app.use('/health', healthRoutes);
  app.use('/api/v1', apiV1Router);

  // ── Error handling (order matters) ─────────────────────────
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
