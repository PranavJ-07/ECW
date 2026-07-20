import { AppError, ForbiddenError } from './AppError';
import { ConflictError } from './auth.errors';

export class CertificateNotFoundError extends AppError {
  constructor(message = 'Certificate not found') {
    super(message, 404, 'CERTIFICATE_NOT_FOUND');
  }
}

export class CertificateAlreadyIssuedError extends ConflictError {
  constructor(message = 'Certificate already issued for this attendee') {
    super(message, 'CERTIFICATE_ALREADY_ISSUED');
  }
}

export class CertificateRevokedError extends AppError {
  constructor(message = 'This certificate has been revoked') {
    super(message, 410, 'CERTIFICATE_REVOKED');
  }
}

export class NotEligibleForCertificateError extends ForbiddenError {
  constructor(message = 'Attendee must have attended the event to receive a certificate') {
    super(message, 'NOT_ELIGIBLE_FOR_CERTIFICATE');
  }
}

export class CertificateEventNotEligibleError extends AppError {
  constructor(message = 'Certificates cannot be issued for this event') {
    super(message, 403, 'CERTIFICATE_EVENT_NOT_ELIGIBLE');
  }
}
