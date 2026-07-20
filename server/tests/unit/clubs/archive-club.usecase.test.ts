import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ArchiveClubUseCase } from '../../../src/application/clubs/use-cases/archive-club.usecase';
import { ForbiddenError } from '../../../src/domain/errors';
import { ClubCategory, ClubStatus, ClubVisibility } from '../../../src/domain/enums/club.enum';
import { UserRole } from '../../../src/domain/enums/user-role.enum';
import { IClubRepository } from '../../../src/domain/interfaces/club.repository.interface';
import { IMembershipRepository } from '../../../src/domain/interfaces/membership.repository.interface';

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

function mockMembershipRepo(): IMembershipRepository {
  return {
    isActiveOfficer: vi.fn(),
    isActivePresident: vi.fn(),
    getActiveRole: vi.fn(),
  };
}

describe('ArchiveClubUseCase', () => {
  let clubRepository: IClubRepository;
  let membershipRepository: IMembershipRepository;
  let useCase: ArchiveClubUseCase;

  beforeEach(() => {
    clubRepository = mockClubRepo();
    membershipRepository = mockMembershipRepo();
    useCase = new ArchiveClubUseCase(clubRepository, membershipRepository);
  });

  it('allows college_admin to archive', async () => {
    vi.mocked(clubRepository.findBySlug).mockResolvedValue(mockClub);
    vi.mocked(clubRepository.archive).mockResolvedValue({ ...mockClub, status: ClubStatus.ARCHIVED });

    const result = await useCase.execute({
      collegeId: 'college1',
      clubSlug: 'robotics-club',
      actorId: 'admin1',
      actorRoles: [UserRole.COLLEGE_ADMIN],
    });

    expect(result.status).toBe(ClubStatus.ARCHIVED);
  });

  it('allows club president to archive their club', async () => {
    vi.mocked(clubRepository.findBySlug).mockResolvedValue(mockClub);
    vi.mocked(membershipRepository.isActivePresident).mockResolvedValue(true);
    vi.mocked(clubRepository.archive).mockResolvedValue({ ...mockClub, status: ClubStatus.ARCHIVED });

    await useCase.execute({
      collegeId: 'college1',
      clubSlug: 'robotics-club',
      actorId: 'president1',
      actorRoles: [UserRole.STUDENT],
    });

    expect(membershipRepository.isActivePresident).toHaveBeenCalledWith('club1', 'president1');
  });

  it('denies regular officer from archiving', async () => {
    vi.mocked(clubRepository.findBySlug).mockResolvedValue(mockClub);
    vi.mocked(membershipRepository.isActivePresident).mockResolvedValue(false);

    await expect(
      useCase.execute({
        collegeId: 'college1',
        clubSlug: 'robotics-club',
        actorId: 'officer1',
        actorRoles: [UserRole.STUDENT],
      }),
    ).rejects.toThrow(ForbiddenError);
  });
});
