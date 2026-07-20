import { AppError, UnauthorizedError } from './AppError';

export class ConflictError extends AppError {
  constructor(message: string, code = 'CONFLICT') {
    super(message, 409, code);
  }
}

export class InvalidCredentialsError extends UnauthorizedError {
  constructor(message = 'Invalid email or password') {
    super(message, 'INVALID_CREDENTIALS');
  }
}

export class AccountLockedError extends AppError {
  constructor(message = 'Account temporarily locked due to too many failed login attempts') {
    super(message, 423, 'ACCOUNT_LOCKED');
  }
}

export class AccountDeactivatedError extends AppError {
  constructor(message = 'Account has been deactivated') {
    super(message, 403, 'ACCOUNT_DEACTIVATED');
  }
}

export class DomainNotAllowedError extends AppError {
  constructor(message = 'Email domain is not allowed for this college') {
    super(message, 400, 'DOMAIN_NOT_ALLOWED');
  }
}
