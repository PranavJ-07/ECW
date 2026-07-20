import { AppError, ForbiddenError } from './AppError';

export class NotificationNotFoundError extends AppError {
  constructor(message = 'Notification not found') {
    super(message, 404, 'NOTIFICATION_NOT_FOUND');
  }
}

export class NotificationAccessDeniedError extends ForbiddenError {
  constructor(message = 'You can only access your own notifications') {
    super(message, 'NOTIFICATION_ACCESS_DENIED');
  }
}
