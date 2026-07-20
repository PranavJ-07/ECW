import { describe, it, expect } from 'vitest';
import { validateEventSchedule } from '../../../src/application/events/services/event-validation.service';
import { EventValidationError } from '../../../src/domain/errors/event.errors';
import { EventLocationMode } from '../../../src/domain/enums/event.enum';

describe('validateEventSchedule', () => {
  it('passes for valid onsite event', () => {
    expect(() =>
      validateEventSchedule({
        startAt: new Date('2026-08-01T10:00:00Z'),
        endAt: new Date('2026-08-01T14:00:00Z'),
        registrationClosesAt: new Date('2026-07-31T23:59:59Z'),
        location: { mode: EventLocationMode.ONSITE, venueName: 'Lab 101' },
      }),
    ).not.toThrow();
  });

  it('throws when endAt is before startAt', () => {
    expect(() =>
      validateEventSchedule({
        startAt: new Date('2026-08-01T14:00:00Z'),
        endAt: new Date('2026-08-01T10:00:00Z'),
        location: { mode: EventLocationMode.ONSITE, venueName: 'Lab 101' },
      }),
    ).toThrow(EventValidationError);
  });

  it('throws when online event missing meetingUrl', () => {
    expect(() =>
      validateEventSchedule({
        startAt: new Date('2026-08-01T10:00:00Z'),
        endAt: new Date('2026-08-01T14:00:00Z'),
        location: { mode: EventLocationMode.ONLINE },
      }),
    ).toThrow(EventValidationError);
  });
});
