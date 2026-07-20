import { describe, it, expect } from 'vitest';
import { CertificateEligibilityService } from '../../../src/application/certificates/services/certificate-eligibility.service';
import { CertificateEventNotEligibleError } from '../../../src/domain/errors/certificate.errors';
import { EventLocationMode, EventStatus, EventVisibility } from '../../../src/domain/enums/event.enum';

const baseEvent = {
  id: 'event1',
  collegeId: 'college1',
  clubId: 'club1',
  title: 'Workshop',
  slug: 'workshop',
  location: { mode: EventLocationMode.ONSITE },
  startAt: new Date('2026-08-01T10:00:00Z'),
  endAt: new Date('2026-08-01T14:00:00Z'),
  timezone: 'America/New_York',
  registrationCount: 10,
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

describe('CertificateEligibilityService', () => {
  const service = new CertificateEligibilityService();

  it('allows published events', () => {
    expect(() => service.assertEventEligible(baseEvent)).not.toThrow();
  });

  it('rejects draft events', () => {
    expect(() =>
      service.assertEventEligible({ ...baseEvent, status: EventStatus.DRAFT }),
    ).toThrow(CertificateEventNotEligibleError);
  });

  it('rejects cancelled events', () => {
    expect(() =>
      service.assertEventEligible({ ...baseEvent, status: EventStatus.CANCELLED }),
    ).toThrow(CertificateEventNotEligibleError);
  });
});
