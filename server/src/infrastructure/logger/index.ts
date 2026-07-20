import pino from 'pino';
import { env } from '../../config';

/**
 * Structured JSON logger.
 * - development: pretty-printed for readability
 * - production: JSON for log aggregators (Datadog, CloudWatch, etc.)
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  ...(env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
});
