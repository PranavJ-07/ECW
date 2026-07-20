import { describe, it, expect } from 'vitest';
import { RegistrationEligibilityService } from '../../../src/application/registrations/services/registration-eligibility.service';
import { EventLocationMode, EventStatus, EventVisibility } from '../../../src/domain/enums/event.enum';
import {
  EmailNotVerifiedRegistrationError,
  EventCancelledRegistrationError,
  RegistrationClosedError,
} from '../../../src/domain/errors/registration.errors';
import { EventMembersOnlyError } from '../../../src/domain/errors/event.errors';
import { Event } from '../../../src/domain/entities/event.entity';

const baseEvent: Event = {
  id: 'event1',
  collegeId: 'college1',
  clubId: 'club1',
  title: 'Workshop',
  slug: 'workshop',
  location: { mode: EventLocationMode.ONSITE, venueName: 'Hall A' },
  startAt: new Date('2026-08-01T10:00:00Z'),
  endAt: new Date('2026-08-01T14:00:00Z'),
  timezone: 'America/New_York',
  registrationCount: 0,
  waitlistCount: 0,
  requiresApproval: false,
  status: EventStatus.PUBLISHED,
  visibility: EventVisibility.COLLEGE_ONLY,
  tags: [],
  createdBy: 'admin1',
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('RegistrationEligibilityService', () => {
  const service = new RegistrationEligibilityService();

  it('allows registration when all criteria are met', () => {
    expect(() =>
      service.assertCanRegister(baseEvent, { emailVerified: true, isMember: false }),
    ).not.toThrow();
  });

  it('throws when email is not verified', () => {
    expect(() =>
      service.assertCanRegister(baseEvent, { emailVerified: false, isMember: false }),
    ).toThrow(EmailNotVerifiedRegistrationError);
  });

  it('throws when event is cancelled', () => {
    expect(() =>
      service.assertCanRegister(
        { ...baseEvent, status: EventStatus.CANCELLED },
        { emailVerified: true, isMember: false },
      ),
    ).toThrow(EventCancelledRegistrationError);
  });

  it('throws when event is not published', () => {
    expect(() =>
      service.assertCanRegister(
        { ...baseEvent, status: EventStatus.DRAFT },
        { emailVerified: true, isMember: false },
      ),
    ).toThrow(RegistrationClosedError);
  });

  it('throws when registration has not opened', () => {
    expect(() =>
      service.assertCanRegister(
        { ...baseEvent, registrationOpensAt: new Date('2026-12-01T00:00:00Z') },
        { emailVerified: true, isMember: false, now: new Date('2026-08-01T00:00:00Z') },
      ),
    ).toThrow(RegistrationClosedError);
  });

  it('throws when registration deadline has passed', () => {
    expect(() =>
      service.assertCanRegister(
        { ...baseEvent, registrationClosesAt: new Date('2026-07-01T00:00:00Z') },
        { emailVerified: true, isMember: false, now: new Date('2026-08-01T00:00:00Z') },
      ),
    ).toThrow(RegistrationClosedError);
  });

  it('throws when event is members-only and user is not a member', () => {
    expect(() =>
      service.assertCanRegister(
        { ...baseEvent, visibility: EventVisibility.MEMBERS_ONLY },
        { emailVerified: true, isMember: false },
      ),
    ).toThrow(EventMembersOnlyError);
  });

  it('allows members-only event when user is a member', () => {
    expect(() =>
      service.assertCanRegister(
        { ...baseEvent, visibility: EventVisibility.MEMBERS_ONLY },
        { emailVerified: true, isMember: true },
      ),
    ).not.toThrow();
  });
});
