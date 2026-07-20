import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RegisterForEventUseCase } from '../../../src/application/registrations/use-cases/register-for-event.usecase';
import { AlreadyRegisteredError } from '../../../src/domain/errors/registration.errors';
import { EventNotFoundError } from '../../../src/domain/errors/event.errors';
import { EventLocationMode, EventStatus, EventVisibility } from '../../../src/domain/enums/event.enum';
import {
  RegistrationApprovalStatus,
  RegistrationSource,
  RegistrationStatus,
} from '../../../src/domain/enums/registration.enum';
import { IEventRepository } from '../../../src/domain/interfaces/event.repository.interface';
import { IMembershipRepository } from '../../../src/domain/interfaces/membership.repository.interface';
import { IRegistrationRepository } from '../../../src/domain/interfaces/registration.repository.interface';

const mockEvent = {
  id: 'event1',
  collegeId: 'college1',
  clubId: 'club1',
  title: 'Workshop',
  slug: 'workshop',
  location: { mode: EventLocationMode.ONSITE, venueName: 'Hall A' },
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

const baseInput = {
  collegeId: 'college1',
  eventSlug: 'workshop',
  userId: 'user1',
  emailVerified: true,
};

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

function mockMembershipRepo(): IMembershipRepository {
  return {
    hasActiveMembership: vi.fn(),
    findByClubAndUser: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
    listByClub: vi.fn(),
    listByUser: vi.fn(),
    isOfficer: vi.fn(),
  };
}

describe('RegisterForEventUseCase', () => {
  let registrationRepository: IRegistrationRepository;
  let eventRepository: IEventRepository;
  let membershipRepository: IMembershipRepository;
  let useCase: RegisterForEventUseCase;

  beforeEach(() => {
    registrationRepository = mockRegistrationRepo();
    eventRepository = mockEventRepo();
    membershipRepository = mockMembershipRepo();
    useCase = new RegisterForEventUseCase(
      registrationRepository,
      eventRepository,
      membershipRepository,
    );
  });

  it('registers user when event is open and capacity available', async () => {
    vi.mocked(eventRepository.findBySlug).mockResolvedValue(mockEvent);
    vi.mocked(registrationRepository.findByEventAndUser).mockResolvedValue(null);
    vi.mocked(membershipRepository.hasActiveMembership).mockResolvedValue(false);
    vi.mocked(eventRepository.reserveRegistrationSlot).mockResolvedValue('registered');
    vi.mocked(registrationRepository.create).mockResolvedValue({
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

    const result = await useCase.execute({ ...baseInput, eventSlug: 'workshop' });

    expect(result.status).toBe(RegistrationStatus.REGISTERED);
    expect(eventRepository.reserveRegistrationSlot).toHaveBeenCalledWith('college1', 'event1');
  });

  it('waitlists user when event is at capacity', async () => {
    vi.mocked(eventRepository.findBySlug).mockResolvedValue({ ...mockEvent, capacity: 5 });
    vi.mocked(registrationRepository.findByEventAndUser).mockResolvedValue(null);
    vi.mocked(membershipRepository.hasActiveMembership).mockResolvedValue(false);
    vi.mocked(eventRepository.reserveRegistrationSlot).mockResolvedValue('waitlisted');
    vi.mocked(registrationRepository.create).mockResolvedValue({
      id: 'reg1',
      collegeId: 'college1',
      eventId: 'event1',
      clubId: 'club1',
      userId: 'user1',
      status: RegistrationStatus.WAITLISTED,
      approvalStatus: RegistrationApprovalStatus.NOT_REQUIRED,
      registeredAt: new Date(),
      source: RegistrationSource.SELF,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute(baseInput);

    expect(result.status).toBe(RegistrationStatus.WAITLISTED);
  });

  it('returns existing registration when idempotency key matches', async () => {
    const existing = {
      id: 'reg-existing',
      collegeId: 'college1',
      eventId: 'event1',
      clubId: 'club1',
      userId: 'user1',
      status: RegistrationStatus.REGISTERED,
      approvalStatus: RegistrationApprovalStatus.NOT_REQUIRED,
      registeredAt: new Date(),
      source: RegistrationSource.SELF,
      idempotencyKey: 'uuid-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(registrationRepository.findByIdempotencyKey).mockResolvedValue(existing);

    const result = await useCase.execute({ ...baseInput, idempotencyKey: 'uuid-123' });

    expect(result.id).toBe('reg-existing');
    expect(eventRepository.findBySlug).not.toHaveBeenCalled();
  });

  it('throws when already registered', async () => {
    vi.mocked(eventRepository.findBySlug).mockResolvedValue(mockEvent);
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

    await expect(useCase.execute(baseInput)).rejects.toThrow(AlreadyRegisteredError);
  });

  it('throws when event not found', async () => {
    vi.mocked(eventRepository.findBySlug).mockResolvedValue(null);

    await expect(useCase.execute(baseInput)).rejects.toThrow(EventNotFoundError);
  });

  it('creates pending approval registration without reserving slot', async () => {
    vi.mocked(eventRepository.findBySlug).mockResolvedValue({
      ...mockEvent,
      requiresApproval: true,
      capacity: 10,
    });
    vi.mocked(registrationRepository.findByEventAndUser).mockResolvedValue(null);
    vi.mocked(membershipRepository.hasActiveMembership).mockResolvedValue(false);
    vi.mocked(registrationRepository.create).mockResolvedValue({
      id: 'reg1',
      collegeId: 'college1',
      eventId: 'event1',
      clubId: 'club1',
      userId: 'user1',
      status: RegistrationStatus.REGISTERED,
      approvalStatus: RegistrationApprovalStatus.PENDING,
      registeredAt: new Date(),
      source: RegistrationSource.SELF,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute(baseInput);

    expect(result.approvalStatus).toBe(RegistrationApprovalStatus.PENDING);
    expect(eventRepository.reserveRegistrationSlot).not.toHaveBeenCalled();
  });
});
