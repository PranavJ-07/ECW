import { CheckInClosedError } from '../../../domain/errors/registration.errors';

/** Check-in is allowed from 2 hours before start until 2 hours after end */
export const CHECK_IN_BUFFER_MS = 2 * 60 * 60 * 1000;

/**
 * Shared check-in time window used by manual check-in and QR attendance.
 */
export class CheckInWindowService {
  isWithinWindow(startAt: Date, endAt: Date, now: Date = new Date()): boolean {
    const windowStart = startAt.getTime() - CHECK_IN_BUFFER_MS;
    const windowEnd = endAt.getTime() + CHECK_IN_BUFFER_MS;
    const ts = now.getTime();

    return ts >= windowStart && ts <= windowEnd;
  }

  assertWithinWindow(startAt: Date, endAt: Date, now: Date = new Date()): void {
    if (!this.isWithinWindow(startAt, endAt, now)) {
      throw new CheckInClosedError();
    }
  }
}

export const checkInWindowService = new CheckInWindowService();
