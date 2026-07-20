import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CheckInAttendeeUseCase } from '../../../src/application/registrations/use-cases/check-in-attendee.usecase';
import { EventAuthorizationService } from '../../../src/application/events/services/event-authorization.service';
import {
  AlreadyCheckedInError,
  CheckInClosedError,
  RegistrationNotFoundError,
} from '../../../src/domain/errors/registration.errors';
import { EventLocationMode, EventStatus, EventVisibility } from '../../../src/domain/enums/event.enum';
import {
  RegistrationApprovalStatus,
  RegistrationSource,
  RegistrationStatus,
} from '../../../src/domain/enums/registration.enum';
import { UserRole } from '../../../src/domain/enums/user-role.enum';
import { IEventRepository } from '../../../src/domain/interfaces/event.repository.interface';
import { IRegistrationRepository } from '../../../src/domain/interfaces/registration.repository.interface';

const eventStart = new Date('2026-08-01T10:00:00Z');
const eventEnd = new Date('2026-08-01T14:00:00Z');

const mockEvent = {
  id: 'event1',
  collegeId: 'college1',
  clubId: 'club1',
  title: 'Workshop',
  slug: 'workshop',
  location: { mode: EventLocationMode.ONSITE },
  startAt: eventStart,
  endAt: eventEnd,
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

const registered = {
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

describe('CheckInAttendeeUseCase', () => {
  let registrationRepository: IRegistrationRepository;
  let eventRepository: IEventRepository;
  let eventAuthService: EventAuthorizationService;
  let useCase: CheckInAttendeeUseCase;

  beforeEach(() => {
    registrationRepository = mockRegistrationRepo();
    eventRepository = mockEventRepo();
    eventAuthService = {
      assertCanManage: vi.fn().mockResolvedValue(undefined),
      canViewMembersOnlyEvent: vi.fn(),
    } as unknown as EventAuthorizationService;
    useCase = new CheckInAttendeeUseCase(
      registrationRepository,
      eventRepository,
      eventAuthService,
    );
  });

  it('checks in attendee within the check-in window', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-01T11:00:00Z'));

    vi.mocked(eventRepository.findBySlug).mockResolvedValue(mockEvent);
    vi.mocked(registrationRepository.findByEventAndUser).mockResolvedValue(registered);
    vi.mocked(registrationRepository.updateStatus).mockResolvedValue({
      ...registered,
      status: RegistrationStatus.ATTENDED,
      checkedInAt: new Date(),
      checkedInBy: 'officer1',
    });

    const result = await useCase.execute({
      collegeId: 'college1',
      eventSlug: 'workshop',
      userId: 'user1',
      actorId: 'officer1',
      actorRoles: [UserRole.STUDENT],
    });

    expect(result.status).toBe(RegistrationStatus.ATTENDED);
    expect(eventAuthService.assertCanManage).toHaveBeenCalledWith('club1', 'officer1', [
      UserRole.STUDENT,
    ]);

    vi.useRealTimers();
  });

  it('throws when check-in window is closed', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-01T00:00:00Z'));

    vi.mocked(eventRepository.findBySlug).mockResolvedValue(mockEvent);

    await expect(
      useCase.execute({
        collegeId: 'college1',
        eventSlug: 'workshop',
        userId: 'user1',
        actorId: 'officer1',
        actorRoles: [UserRole.STUDENT],
      }),
    ).rejects.toThrow(CheckInClosedError);

    vi.useRealTimers();
  });

  it('throws when already checked in', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-01T11:00:00Z'));

    vi.mocked(eventRepository.findBySlug).mockResolvedValue(mockEvent);
    vi.mocked(registrationRepository.findByEventAndUser).mockResolvedValue({
      ...registered,
      status: RegistrationStatus.ATTENDED,
      checkedInAt: new Date(),
    });

    await expect(
      useCase.execute({
        collegeId: 'college1',
        eventSlug: 'workshop',
        userId: 'user1',
        actorId: 'officer1',
        actorRoles: [UserRole.STUDENT],
      }),
    ).rejects.toThrow(AlreadyCheckedInError);

    vi.useRealTimers();
  });

  it('throws when registration not found', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-01T11:00:00Z'));

    vi.mocked(eventRepository.findBySlug).mockResolvedValue(mockEvent);
    vi.mocked(registrationRepository.findByEventAndUser).mockResolvedValue(null);

    await expect(
      useCase.execute({
        collegeId: 'college1',
        eventSlug: 'workshop',
        userId: 'user1',
        actorId: 'officer1',
        actorRoles: [UserRole.STUDENT],
      }),
    ).rejects.toThrow(RegistrationNotFoundError);

    vi.useRealTimers();
  });
});
