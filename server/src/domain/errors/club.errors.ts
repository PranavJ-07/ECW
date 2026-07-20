import { AppError } from './AppError';
import { ConflictError } from './auth.errors';

export class ClubNotFoundError extends AppError {
  constructor(message = 'Club not found') {
    super(message, 404, 'CLUB_NOT_FOUND');
  }
}

export class ClubSlugExistsError extends ConflictError {
  constructor(message = 'Club slug already exists in this college') {
    super(message, 'SLUG_ALREADY_EXISTS');
  }
}

export class ClubArchivedError extends AppError {
  constructor(message = 'Club is archived and cannot be modified') {
    super(message, 403, 'CLUB_ARCHIVED');
  }
}

export class TenantMismatchError extends AppError {
  constructor(message = 'Access denied for this college') {
    super(message, 403, 'TENANT_MISMATCH');
  }
}
