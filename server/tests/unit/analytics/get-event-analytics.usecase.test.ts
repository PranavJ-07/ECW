import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetEventAnalyticsUseCase } from '../../../src/application/analytics/use-cases/get-event-analytics.usecase';
import { EventAuthorizationService } from '../../../src/application/events/services/event-authorization.service';
import { EventNotFoundError } from '../../../src/domain/errors/event.errors';
import { EventLocationMode, EventStatus, EventVisibility } from '../../../src/domain/enums/event.enum';
import { UserRole } from '../../../src/domain/enums/user-role.enum';
import { IAnalyticsRepository } from '../../../src/domain/interfaces/analytics.repository.interface';
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
  registrationCount: 50,
  waitlistCount: 5,
  requiresApproval: false,
  status: EventStatus.PUBLISHED,
  visibility: EventVisibility.COLLEGE_ONLY,
  tags: [],
  createdBy: 'admin1',
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function mockAnalyticsRepo(): IAnalyticsRepository {
  return {
    getCollegeOverview: vi.fn(),
    getClubAnalytics: vi.fn(),
    getEventAnalytics: vi.fn(),
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

describe('GetEventAnalyticsUseCase', () => {
  let analyticsRepository: IAnalyticsRepository;
  let eventRepository: IEventRepository;
  let useCase: GetEventAnalyticsUseCase;

  beforeEach(() => {
    analyticsRepository = mockAnalyticsRepo();
    eventRepository = mockEventRepo();
    useCase = new GetEventAnalyticsUseCase(
      analyticsRepository,
      eventRepository,
      { assertCanManage: vi.fn().mockResolvedValue(undefined) } as unknown as EventAuthorizationService,
    );
  });

  it('returns event analytics for authorized officer', async () => {
    vi.mocked(eventRepository.findBySlug).mockResolvedValue(mockEvent);
    vi.mocked(analyticsRepository.getEventAnalytics).mockResolvedValue({
      collegeId: 'college1',
      eventId: 'event1',
      eventTitle: 'Workshop',
      eventSlug: 'workshop',
      clubId: 'club1',
      generatedAt: new Date(),
      capacity: 100,
      registrationCount: 50,
      waitlistCount: 5,
      fillRate: 50,
      attendance: {
        registered: 10,
        attended: 40,
        cancelled: 5,
        waitlisted: 5,
        noShow: 0,
        attendanceRate: 80,
      },
      checkIns: { total: 40, qrScan: 35, manual: 5 },
      certificates: { issued: 40 },
    });

    const result = await useCase.execute({
      collegeId: 'college1',
      eventSlug: 'workshop',
      actorId: 'officer1',
      actorRoles: [UserRole.STUDENT],
    });

    expect(result.fillRate).toBe(50);
    expect(result.checkIns.qrScan).toBe(35);
  });

  it('throws when event not found', async () => {
    vi.mocked(eventRepository.findBySlug).mockResolvedValue(null);

    await expect(
      useCase.execute({
        collegeId: 'college1',
        eventSlug: 'missing',
        actorId: 'officer1',
        actorRoles: [UserRole.STUDENT],
      }),
    ).rejects.toThrow(EventNotFoundError);
  });
});
