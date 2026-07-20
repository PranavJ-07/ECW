import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateEventUseCase } from '../../../src/application/events/use-cases/create-event.usecase';
import { EventAuthorizationService } from '../../../src/application/events/services/event-authorization.service';
import { ClubArchivedError, ClubNotFoundError } from '../../../src/domain/errors/club.errors';
import { EventSlugExistsError } from '../../../src/domain/errors/event.errors';
import { ClubCategory, ClubStatus, ClubVisibility } from '../../../src/domain/enums/club.enum';
import { EventLocationMode } from '../../../src/domain/enums/event.enum';
import { UserRole } from '../../../src/domain/enums/user-role.enum';
import { IClubRepository } from '../../../src/domain/interfaces/club.repository.interface';
import { IEventRepository } from '../../../src/domain/interfaces/event.repository.interface';

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
  createdBy: 'user1',
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseInput = {
  collegeId: 'college1',
  clubSlug: 'robotics-club',
  title: 'Robotics Workshop',
  slug: 'robotics-workshop-2026',
  location: { mode: EventLocationMode.ONSITE, venueName: 'Lab 101' },
  startAt: new Date('2026-08-01T10:00:00Z'),
  endAt: new Date('2026-08-01T14:00:00Z'),
  timezone: 'America/New_York',
  actorId: 'officer1',
  actorRoles: [UserRole.STUDENT] as UserRole[],
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

describe('CreateEventUseCase', () => {
  let eventRepository: IEventRepository;
  let clubRepository: IClubRepository;
  let eventAuthService: EventAuthorizationService;
  let useCase: CreateEventUseCase;

  beforeEach(() => {
    eventRepository = mockEventRepo();
    clubRepository = mockClubRepo();
    eventAuthService = {
      assertCanManage: vi.fn().mockResolvedValue(undefined),
      canViewMembersOnlyEvent: vi.fn(),
    } as unknown as EventAuthorizationService;
    useCase = new CreateEventUseCase(eventRepository, clubRepository, eventAuthService);
  });

  it('creates a draft event when club is active and slug is unique', async () => {
    vi.mocked(clubRepository.findBySlug).mockResolvedValue(mockClub);
    vi.mocked(eventRepository.slugExists).mockResolvedValue(false);
    vi.mocked(eventRepository.create).mockResolvedValue({
      id: 'event1',
      collegeId: 'college1',
      clubId: 'club1',
      title: 'Robotics Workshop',
      slug: 'robotics-workshop-2026',
      location: baseInput.location,
      startAt: baseInput.startAt,
      endAt: baseInput.endAt,
      timezone: 'America/New_York',
      registrationCount: 0,
      waitlistCount: 0,
      requiresApproval: false,
      status: 'draft' as import('../../../src/domain/enums/event.enum').EventStatus,
      visibility: ClubVisibility.COLLEGE_ONLY,
      tags: [],
      createdBy: 'officer1',
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute(baseInput);

    expect(result.slug).toBe('robotics-workshop-2026');
    expect(eventAuthService.assertCanManage).toHaveBeenCalledWith('club1', 'officer1', baseInput.actorRoles);
  });

  it('throws when club is archived', async () => {
    vi.mocked(clubRepository.findBySlug).mockResolvedValue({ ...mockClub, status: ClubStatus.ARCHIVED });

    await expect(useCase.execute(baseInput)).rejects.toThrow(ClubArchivedError);
  });

  it('throws when club not found', async () => {
    vi.mocked(clubRepository.findBySlug).mockResolvedValue(null);

    await expect(useCase.execute(baseInput)).rejects.toThrow(ClubNotFoundError);
  });

  it('throws when event slug already exists', async () => {
    vi.mocked(clubRepository.findBySlug).mockResolvedValue(mockClub);
    vi.mocked(eventRepository.slugExists).mockResolvedValue(true);

    await expect(useCase.execute(baseInput)).rejects.toThrow(EventSlugExistsError);
  });
});
