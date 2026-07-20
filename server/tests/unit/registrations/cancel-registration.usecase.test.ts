import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CancelRegistrationUseCase } from '../../../src/application/registrations/use-cases/cancel-registration.usecase';
import { RegistrationNotFoundError } from '../../../src/domain/errors/registration.errors';
import { EventLocationMode, EventStatus, EventVisibility } from '../../../src/domain/enums/event.enum';
import {
  RegistrationApprovalStatus,
  RegistrationSource,
  RegistrationStatus,
} from '../../../src/domain/enums/registration.enum';
import { IEventRepository } from '../../../src/domain/interfaces/event.repository.interface';
import { IRegistrationRepository } from '../../../src/domain/interfaces/registration.repository.interface';

const mockEvent = {
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
  waitlistCount: 2,
  requiresApproval: false,
  status: EventStatus.PUBLISHED,
  visibility: EventVisibility.COLLEGE_ONLY,
  tags: [],
  createdBy: 'admin1',
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const activeRegistration = {
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

describe('CancelRegistrationUseCase', () => {
  let registrationRepository: IRegistrationRepository;
  let eventRepository: IEventRepository;
  let useCase: CancelRegistrationUseCase;

  beforeEach(() => {
    registrationRepository = mockRegistrationRepo();
    eventRepository = mockEventRepo();
    useCase = new CancelRegistrationUseCase(registrationRepository, eventRepository);
  });

  it('cancels registration and promotes waitlist when user was registered', async () => {
    vi.mocked(eventRepository.findBySlug).mockResolvedValue(mockEvent);
    vi.mocked(registrationRepository.findByEventAndUser).mockResolvedValue(activeRegistration);
    vi.mocked(registrationRepository.updateStatus).mockResolvedValue({
      ...activeRegistration,
      status: RegistrationStatus.CANCELLED,
      cancelledAt: new Date(),
    });
    vi.mocked(registrationRepository.findOldestWaitlisted).mockResolvedValue({
      ...activeRegistration,
      id: 'reg2',
      userId: 'user2',
      status: RegistrationStatus.WAITLISTED,
    });

    const result = await useCase.execute({
      collegeId: 'college1',
      eventSlug: 'workshop',
      userId: 'user1',
    });

    expect(result.status).toBe(RegistrationStatus.CANCELLED);
    expect(eventRepository.releaseRegistrationSlot).toHaveBeenCalledWith('college1', 'event1', true);
    expect(registrationRepository.updateStatus).toHaveBeenCalledTimes(2);
    expect(eventRepository.promoteWaitlistSlot).toHaveBeenCalledWith('college1', 'event1');
  });

  it('cancels waitlisted registration without promoting', async () => {
    vi.mocked(eventRepository.findBySlug).mockResolvedValue(mockEvent);
    vi.mocked(registrationRepository.findByEventAndUser).mockResolvedValue({
      ...activeRegistration,
      status: RegistrationStatus.WAITLISTED,
    });
    vi.mocked(registrationRepository.updateStatus).mockResolvedValue({
      ...activeRegistration,
      status: RegistrationStatus.CANCELLED,
      cancelledAt: new Date(),
    });

    await useCase.execute({
      collegeId: 'college1',
      eventSlug: 'workshop',
      userId: 'user1',
    });

    expect(eventRepository.releaseRegistrationSlot).toHaveBeenCalledWith('college1', 'event1', false);
    expect(registrationRepository.findOldestWaitlisted).not.toHaveBeenCalled();
  });

  it('throws when no registration exists', async () => {
    vi.mocked(eventRepository.findBySlug).mockResolvedValue(mockEvent);
    vi.mocked(registrationRepository.findByEventAndUser).mockResolvedValue(null);

    await expect(
      useCase.execute({ collegeId: 'college1', eventSlug: 'workshop', userId: 'user1' }),
    ).rejects.toThrow(RegistrationNotFoundError);
  });
});
