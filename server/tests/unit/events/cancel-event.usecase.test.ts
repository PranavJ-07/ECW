import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CancelEventUseCase } from '../../../src/application/events/use-cases/cancel-event.usecase';
import { EventAuthorizationService } from '../../../src/application/events/services/event-authorization.service';
import { EventInvalidStatusError } from '../../../src/domain/errors/event.errors';
import { EventLocationMode, EventStatus, EventVisibility } from '../../../src/domain/enums/event.enum';
import { UserRole } from '../../../src/domain/enums/user-role.enum';
import { IEventRepository } from '../../../src/domain/interfaces/event.repository.interface';

const mockPublishedEvent = {
  id: 'event1',
  collegeId: 'college1',
  clubId: 'club1',
  title: 'Workshop',
  slug: 'workshop',
  location: { mode: EventLocationMode.ONSITE, venueName: 'Lab 101' },
  startAt: new Date('2026-08-01T10:00:00Z'),
  endAt: new Date('2026-08-01T14:00:00Z'),
  timezone: 'UTC',
  registrationCount: 5,
  waitlistCount: 0,
  requiresApproval: false,
  status: EventStatus.PUBLISHED,
  visibility: EventVisibility.COLLEGE_ONLY,
  tags: [],
  createdBy: 'user1',
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

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
  };
}

describe('CancelEventUseCase', () => {
  let eventRepository: IEventRepository;
  let eventAuthService: EventAuthorizationService;
  let useCase: CancelEventUseCase;

  beforeEach(() => {
    eventRepository = mockEventRepo();
    eventAuthService = {
      assertCanManage: vi.fn().mockResolvedValue(undefined),
      canViewMembersOnlyEvent: vi.fn(),
    } as unknown as EventAuthorizationService;
    useCase = new CancelEventUseCase(eventRepository, eventAuthService);
  });

  it('cancels a published event with reason', async () => {
    vi.mocked(eventRepository.findBySlug).mockResolvedValue(mockPublishedEvent);
    vi.mocked(eventRepository.cancel).mockResolvedValue({
      ...mockPublishedEvent,
      status: EventStatus.CANCELLED,
      cancelledAt: new Date(),
      cancelReason: 'Venue unavailable',
    });

    const result = await useCase.execute({
      collegeId: 'college1',
      eventSlug: 'workshop',
      reason: 'Venue unavailable',
      actorId: 'admin1',
      actorRoles: [UserRole.COLLEGE_ADMIN],
    });

    expect(result.status).toBe(EventStatus.CANCELLED);
    expect(result.cancelReason).toBe('Venue unavailable');
  });

  it('rejects cancelling a draft event', async () => {
    vi.mocked(eventRepository.findBySlug).mockResolvedValue({
      ...mockPublishedEvent,
      status: EventStatus.DRAFT,
    });

    await expect(
      useCase.execute({
        collegeId: 'college1',
        eventSlug: 'workshop',
        actorId: 'admin1',
        actorRoles: [UserRole.COLLEGE_ADMIN],
      }),
    ).rejects.toThrow(EventInvalidStatusError);
  });
});
