import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RevokeCertificateUseCase } from '../../../src/application/certificates/use-cases/revoke-certificate.usecase';
import { EventAuthorizationService } from '../../../src/application/events/services/event-authorization.service';
import { CertificateNotFoundError } from '../../../src/domain/errors/certificate.errors';
import { EventLocationMode, EventStatus, EventVisibility } from '../../../src/domain/enums/event.enum';
import { CertificateStatus } from '../../../src/domain/enums/certificate.enum';
import { UserRole } from '../../../src/domain/enums/user-role.enum';
import { ICertificateRepository } from '../../../src/domain/interfaces/certificate.repository.interface';
import { IEventRepository } from '../../../src/domain/interfaces/event.repository.interface';

const mockEvent = {
  id: 'event1',
  collegeId: 'college1',
  clubId: 'club1',
  title: 'Workshop',
  slug: 'workshop',
  location: { mode: EventLocationMode.ONSITE },
  startAt: new Date(),
  endAt: new Date(),
  timezone: 'America/New_York',
  registrationCount: 1,
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

function mockCertRepo(): ICertificateRepository {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findByEventAndUser: vi.fn(),
    findByVerificationCode: vi.fn(),
    getVerificationView: vi.fn(),
    listByEvent: vi.fn(),
    listByUser: vi.fn(),
    revoke: vi.fn(),
  };
}

function mockEventRepo(): IEventRepository {
  return {
    findBySlug: vi.fn(),
    findById: vi.fn(),
    slugExists: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    publish: vi.fn(),
    cancel: vi.fn(),
    softDelete: vi.fn(),
    list: vi.fn(),
    reserveRegistrationSlot: vi.fn(),
    releaseRegistrationSlot: vi.fn(),
    promoteWaitlistSlot: vi.fn(),
  };
}

describe('RevokeCertificateUseCase', () => {
  let certificateRepository: ICertificateRepository;
  let eventRepository: IEventRepository;
  let useCase: RevokeCertificateUseCase;

  beforeEach(() => {
    certificateRepository = mockCertRepo();
    eventRepository = mockEventRepo();
    useCase = new RevokeCertificateUseCase(
      certificateRepository,
      eventRepository,
      { assertCanManage: vi.fn().mockResolvedValue(undefined) } as unknown as EventAuthorizationService,
    );
  });

  it('revokes an issued certificate', async () => {
    vi.mocked(eventRepository.findBySlug).mockResolvedValue(mockEvent);
    vi.mocked(certificateRepository.findById).mockResolvedValue({
      id: 'cert1',
      collegeId: 'college1',
      eventId: 'event1',
      clubId: 'club1',
      userId: 'user1',
      registrationId: 'reg1',
      certificateNumber: 'EC-2026-ABCD1234',
      verificationCode: 'code',
      recipientName: 'Jane Doe',
      eventTitle: 'Workshop',
      eventDate: new Date(),
      issuedAt: new Date(),
      issuedBy: 'officer1',
      status: CertificateStatus.ISSUED,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(certificateRepository.revoke).mockResolvedValue({
      id: 'cert1',
      collegeId: 'college1',
      eventId: 'event1',
      clubId: 'club1',
      userId: 'user1',
      registrationId: 'reg1',
      certificateNumber: 'EC-2026-ABCD1234',
      verificationCode: 'code',
      recipientName: 'Jane Doe',
      eventTitle: 'Workshop',
      eventDate: new Date(),
      issuedAt: new Date(),
      issuedBy: 'officer1',
      status: CertificateStatus.REVOKED,
      revokedAt: new Date(),
      revokedBy: 'officer1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute({
      collegeId: 'college1',
      eventSlug: 'workshop',
      certificateId: 'cert1',
      actorId: 'officer1',
      actorRoles: [UserRole.STUDENT],
      reason: 'Fraudulent attendance',
    });

    expect(result.status).toBe(CertificateStatus.REVOKED);
    expect(certificateRepository.revoke).toHaveBeenCalled();
  });

  it('throws when certificate not found for event', async () => {
    vi.mocked(eventRepository.findBySlug).mockResolvedValue(mockEvent);
    vi.mocked(certificateRepository.findById).mockResolvedValue(null);

    await expect(
      useCase.execute({
        collegeId: 'college1',
        eventSlug: 'workshop',
        certificateId: 'cert1',
        actorId: 'officer1',
        actorRoles: [UserRole.STUDENT],
      }),
    ).rejects.toThrow(CertificateNotFoundError);
  });
});
