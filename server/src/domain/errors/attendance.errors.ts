import { AppError, ForbiddenError } from './AppError';

export class InvalidQrTokenError extends AppError {
  constructor(message = 'Invalid attendance QR code') {
    super(message, 400, 'INVALID_QR_TOKEN');
  }
}

export class QrTokenExpiredError extends AppError {
  constructor(message = 'Attendance QR code has expired') {
    super(message, 403, 'QR_EXPIRED');
  }
}

export class QrTokenMismatchError extends ForbiddenError {
  constructor(message = 'QR code does not match this event') {
    super(message, 'QR_MISMATCH');
  }
}

export class QrGenerationNotAvailableError extends AppError {
  constructor(message = 'QR check-in is not available at this time') {
    super(message, 403, 'QR_NOT_AVAILABLE');
  }
}
