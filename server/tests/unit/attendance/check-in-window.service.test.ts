import { describe, it, expect } from 'vitest';
import { CheckInWindowService, CHECK_IN_BUFFER_MS } from '../../../src/application/attendance/services/check-in-window.service';

describe('CheckInWindowService', () => {
  const service = new CheckInWindowService();
  const startAt = new Date('2026-08-01T10:00:00Z');
  const endAt = new Date('2026-08-01T14:00:00Z');

  it('allows check-in within the buffer window', () => {
    const duringEvent = new Date('2026-08-01T11:00:00Z');
    expect(service.isWithinWindow(startAt, endAt, duringEvent)).toBe(true);
  });

  it('allows check-in exactly at window start', () => {
    const windowStart = new Date(startAt.getTime() - CHECK_IN_BUFFER_MS);
    expect(service.isWithinWindow(startAt, endAt, windowStart)).toBe(true);
  });

  it('rejects check-in before the window opens', () => {
    const tooEarly = new Date(startAt.getTime() - CHECK_IN_BUFFER_MS - 1000);
    expect(service.isWithinWindow(startAt, endAt, tooEarly)).toBe(false);
  });

  it('rejects check-in after the window closes', () => {
    const tooLate = new Date(endAt.getTime() + CHECK_IN_BUFFER_MS + 1000);
    expect(service.isWithinWindow(startAt, endAt, tooLate)).toBe(false);
  });
});
