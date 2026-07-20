import { AppError, ForbiddenError } from './AppError';
import { ConflictError } from './auth.errors';

export class RegistrationNotFoundError extends AppError {
  constructor(message = 'Registration not found') {
    super(message, 404, 'NOT_REGISTERED');
  }
}

export class AlreadyRegisteredError extends ConflictError {
  constructor(message = 'Already registered for this event') {
    super(message, 'ALREADY_REGISTERED');
  }
}

export class RegistrationClosedError extends AppError {
  constructor(message = 'Registration is closed for this event') {
    super(message, 403, 'REGISTRATION_CLOSED');
  }
}

export class EventCancelledRegistrationError extends AppError {
  constructor(message = 'Cannot register for a cancelled event') {
    super(message, 403, 'EVENT_CANCELLED');
  }
}

export class MembersOnlyRegistrationError extends ForbiddenError {
  constructor(message = 'Only club members can register for this event') {
    super(message, 'MEMBERS_ONLY');
  }
}

export class AlreadyCheckedInError extends ConflictError {
  constructor(message = 'Attendee already checked in') {
    super(message, 'ALREADY_CHECKED_IN');
  }
}

export class CheckInClosedError extends AppError {
  constructor(message = 'Check-in is not available at this time') {
    super(message, 403, 'CHECK_IN_CLOSED');
  }
}

export class EmailNotVerifiedRegistrationError extends ForbiddenError {
  constructor(message = 'Email verification required to register') {
    super(message, 'EMAIL_NOT_VERIFIED');
  }
}
