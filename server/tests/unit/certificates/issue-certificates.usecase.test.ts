import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IssueCertificatesUseCase } from '../../../src/application/certificates/use-cases/issue-certificates.usecase';
import { CertificateEligibilityService } from '../../../src/application/certificates/services/certificate-eligibility.service';
import { CertificateIdentityService } from '../../../src/application/certificates/services/certificate-identity.service';
import { EventAuthorizationService } from '../../../src/application/events/services/event-authorization.service';
import { EventLocationMode, EventStatus, EventVisibility } from '../../../src/domain/enums/event.enum';
import { ClubCategory, ClubStatus, ClubVisibility } from '../../../src/domain/enums/club.enum';
import {
  RegistrationApprovalStatus,
  RegistrationSource,
  RegistrationStatus,
} from '../../../src/domain/enums/registration.enum';
import { CertificateStatus } from '../../../src/domain/enums/certificate.enum';
import { UserRole } from '../../../src/domain/enums/user-role.enum';
import { ICertificateRepository } from '../../../src/domain/interfaces/certificate.repository.interface';
import { IClubRepository } from '../../../src/domain/interfaces/club.repository.interface';
import { IEventRepository } from '../../../src/domain/interfaces/event.repository.interface';
import { IRegistrationRepository } from '../../../src/domain/interfaces/registration.repository.interface';
import { IUserRepository } from '../../../src/domain/interfaces/user.repository.interface';

const mockEvent = {
  id: 'event1',
  collegeId: 'college1',
  clubId: 'club1',
  title: 'Robotics Workshop',
  slug: 'robotics-workshop',
  location: { mode: EventLocationMode.ONSITE },
  startAt: new Date('2026-08-01T10:00:00Z'),
  endAt: new Date('2026-08-01T14:00:00Z'),
  timezone: 'America/New_York',
  registrationCount: 5,
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

const mockClub = {
  id: 'club1',
  collegeId: 'college1',
  name: 'Robotics Club',
  slug: 'robotics-club',
  category: ClubCategory.TECH,
  tags: [],
  status: ClubStatus.ACTIVE,
  visibility: ClubVisibility.COLLEGE_ONLY,
  memberCount: 10,
  officerCount: 2,
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

function mockRegistrationRepo(): IRegistrationRepository {
  return {
    findByEventAndUser: vi.fn(),
    findById: vi.fn(),
    findByIdempotencyKey: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
    listByEvent: vi.fn(),
    listByUser: vi.fn(),
    findOldestWaitlisted: vi.fn(),
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

function mockClubRepo(): IClubRepository {
  return {
    findBySlug: vi.fn(),
    findById: vi.fn(),
    slugExists: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    archive: vi.fn(),
    list: vi.fn(),
    countActiveByCollege: vi.fn(),
  };
}

function mockUserRepo(): IUserRepository {
  return {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findByEmailWithPassword: vi.fn(),
    create: vi.fn(),
    updateLoginSuccess: vi.fn(),
    incrementFailedLoginAttempts: vi.fn(),
  };
}

describe('IssueCertificatesUseCase', () => {
  let useCase: IssueCertificatesUseCase;
  let certificateRepository: ICertificateRepository;
  let registrationRepository: IRegistrationRepository;
  let eventRepository: IEventRepository;
  let clubRepository: IClubRepository;
  let userRepository: IUserRepository;

  beforeEach(() => {
    certificateRepository = mockCertRepo();
    registrationRepository = mockRegistrationRepo();
    eventRepository = mockEventRepo();
    clubRepository = mockClubRepo();
    userRepository = mockUserRepo();

    useCase = new IssueCertificatesUseCase(
      certificateRepository,
      registrationRepository,
      eventRepository,
      clubRepository,
      userRepository,
      { assertCanManage: vi.fn().mockResolvedValue(undefined) } as unknown as EventAuthorizationService,
      new CertificateEligibilityService(),
      new CertificateIdentityService(),
    );
  });

  it('issues certificate to attended user', async () => {
    vi.mocked(eventRepository.findBySlug).mockResolvedValue(mockEvent);
    vi.mocked(clubRepository.findById).mockResolvedValue(mockClub);
    vi.mocked(registrationRepository.findByEventAndUser).mockResolvedValue({
      id: 'reg1',
      collegeId: 'college1',
      eventId: 'event1',
      clubId: 'club1',
      userId: 'user1',
      status: RegistrationStatus.ATTENDED,
      approvalStatus: RegistrationApprovalStatus.NOT_REQUIRED,
      registeredAt: new Date(),
      source: RegistrationSource.SELF,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(certificateRepository.findByEventAndUser).mockResolvedValue(null);
    vi.mocked(userRepository.findById).mockResolvedValue({
      id: 'user1',
      collegeId: 'college1',
      email: 'user@mit.edu',
      firstName: 'Jane',
      lastName: 'Doe',
      roles: [UserRole.STUDENT],
      platformRole: null,
      emailVerified: true,
      isActive: true,
      failedLoginAttempts: 0,
      lockUntil: null,
      lastLoginAt: null,
      passwordChangedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(certificateRepository.create).mockResolvedValue({
      id: 'cert1',
      collegeId: 'college1',
      eventId: 'event1',
      clubId: 'club1',
      userId: 'user1',
      registrationId: 'reg1',
      certificateNumber: 'EC-2026-ABCD1234',
      verificationCode: 'verify-code',
      recipientName: 'Jane Doe',
      eventTitle: 'Robotics Workshop',
      eventDate: mockEvent.startAt,
      clubName: 'Robotics Club',
      issuedAt: new Date(),
      issuedBy: 'officer1',
      status: CertificateStatus.ISSUED,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute({
      collegeId: 'college1',
      eventSlug: 'robotics-workshop',
      userIds: ['user1'],
      actorId: 'officer1',
      actorRoles: [UserRole.STUDENT],
    });

    expect(result.issued).toHaveLength(1);
    expect(result.skipped).toHaveLength(0);
    expect(certificateRepository.create).toHaveBeenCalled();
  });

  it('skips users who have not attended', async () => {
    vi.mocked(eventRepository.findBySlug).mockResolvedValue(mockEvent);
    vi.mocked(clubRepository.findById).mockResolvedValue(mockClub);
    vi.mocked(registrationRepository.findByEventAndUser).mockResolvedValue({
      id: 'reg1',
      collegeId: 'college1',
      eventId: 'event1',
      clubId: 'club1',
      userId: 'user1',
      status: RegistrationStatus.REGISTERED,
      approvalStatus: RegistrationApprovalStatus.NOT_REQUIRED,
      registeredAt: new Date(),
      source: RegistrationSource.SELF,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute({
      collegeId: 'college1',
      eventSlug: 'robotics-workshop',
      userIds: ['user1'],
      actorId: 'officer1',
      actorRoles: [UserRole.STUDENT],
    });

    expect(result.issued).toHaveLength(0);
    expect(result.skipped).toHaveLength(1);
  });
});
