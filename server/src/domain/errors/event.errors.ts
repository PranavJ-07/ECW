import { AppError, ForbiddenError } from './AppError';
import { ConflictError } from './auth.errors';

export class EventNotFoundError extends AppError {
  constructor(message = 'Event not found') {
    super(message, 404, 'EVENT_NOT_FOUND');
  }
}

export class EventSlugExistsError extends ConflictError {
  constructor(message = 'Event slug already exists in this college') {
    super(message, 'SLUG_ALREADY_EXISTS');
  }
}

export class EventNotDraftError extends AppError {
  constructor(message = 'Only draft events can be deleted') {
    super(message, 400, 'EVENT_NOT_DRAFT');
  }
}

export class EventInvalidStatusError extends AppError {
  constructor(message: string, code = 'EVENT_INVALID_STATUS') {
    super(message, 400, code);
  }
}

export class EventMembersOnlyError extends ForbiddenError {
  constructor(message = 'This event is only visible to club members') {
    super(message, 'MEMBERS_ONLY');
  }
}

export class EventValidationError extends AppError {
  constructor(message: string, details?: unknown[]) {
    super(message, 400, 'VALIDATION_ERROR', { details });
  }
}
