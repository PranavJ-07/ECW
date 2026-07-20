import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PublishEventUseCase } from '../../../src/application/events/use-cases/publish-event.usecase';
import { EventAuthorizationService } from '../../../src/application/events/services/event-authorization.service';
import { EventInvalidStatusError } from '../../../src/domain/errors/event.errors';
import { EventLocationMode, EventStatus, EventVisibility } from '../../../src/domain/enums/event.enum';
import { UserRole } from '../../../src/domain/enums/user-role.enum';
import { IEventRepository } from '../../../src/domain/interfaces/event.repository.interface';

const mockEvent = {
  id: 'event1',
  collegeId: 'college1',
  clubId: 'club1',
  title: 'Workshop',
  slug: 'workshop',
  location: { mode: EventLocationMode.ONSITE, venueName: 'Lab 101' },
  startAt: new Date('2026-08-01T10:00:00Z'),
  endAt: new Date('2026-08-01T14:00:00Z'),
  timezone: 'UTC',
  registrationCount: 0,
  waitlistCount: 0,
  requiresApproval: false,
  status: EventStatus.DRAFT,
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

describe('PublishEventUseCase', () => {
  let eventRepository: IEventRepository;
  let eventAuthService: EventAuthorizationService;
  let useCase: PublishEventUseCase;

  beforeEach(() => {
    eventRepository = mockEventRepo();
    eventAuthService = {
      assertCanManage: vi.fn().mockResolvedValue(undefined),
      canViewMembersOnlyEvent: vi.fn(),
    } as unknown as EventAuthorizationService;
    useCase = new PublishEventUseCase(eventRepository, eventAuthService);
  });

  it('publishes a draft event', async () => {
    vi.mocked(eventRepository.findBySlug).mockResolvedValue(mockEvent);
    vi.mocked(eventRepository.publish).mockResolvedValue({
      ...mockEvent,
      status: EventStatus.PUBLISHED,
      publishedAt: new Date(),
    });

    const result = await useCase.execute({
      collegeId: 'college1',
      eventSlug: 'workshop',
      actorId: 'officer1',
      actorRoles: [UserRole.STUDENT],
    });

    expect(result.status).toBe(EventStatus.PUBLISHED);
  });

  it('rejects publishing a non-draft event', async () => {
    vi.mocked(eventRepository.findBySlug).mockResolvedValue({
      ...mockEvent,
      status: EventStatus.PUBLISHED,
    });

    await expect(
      useCase.execute({
        collegeId: 'college1',
        eventSlug: 'workshop',
        actorId: 'officer1',
        actorRoles: [UserRole.COLLEGE_ADMIN],
      }),
    ).rejects.toThrow(EventInvalidStatusError);
  });
});
