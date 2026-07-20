import { ForbiddenError } from './AppError';

export class AnalyticsAccessDeniedError extends ForbiddenError {
  constructor(message = 'You do not have permission to view these analytics') {
    super(message, 'ANALYTICS_ACCESS_DENIED');
  }
}
