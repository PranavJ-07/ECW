import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetClubUseCase } from '../../../src/application/clubs/use-cases/get-club.usecase';
import { ClubNotFoundError } from '../../../src/domain/errors/club.errors';
import { ClubCategory, ClubStatus, ClubVisibility, MembershipRole } from '../../../src/domain/enums/club.enum';
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

describe('GetClubUseCase', () => {
  let clubRepository: IClubRepository;
  let membershipRepository: IMembershipRepository;
  let useCase: GetClubUseCase;

  beforeEach(() => {
    clubRepository = mockClubRepo();
    membershipRepository = mockMembershipRepo();
    useCase = new GetClubUseCase(clubRepository, membershipRepository);
  });

  it('returns club with membership when user is a member', async () => {
    vi.mocked(clubRepository.findBySlug).mockResolvedValue(mockClub);
    vi.mocked(membershipRepository.getActiveRole).mockResolvedValue(MembershipRole.PRESIDENT);

    const result = await useCase.execute({
      collegeId: 'college1',
      clubSlug: 'robotics-club',
      userId: 'user1',
    });

    expect(result.name).toBe('Robotics Club');
    expect(result.myMembership).toEqual({ role: MembershipRole.PRESIDENT, status: 'active' });
  });

  it('throws ClubNotFoundError when club does not exist', async () => {
    vi.mocked(clubRepository.findBySlug).mockResolvedValue(null);

    await expect(
      useCase.execute({ collegeId: 'college1', clubSlug: 'missing' }),
    ).rejects.toThrow(ClubNotFoundError);
  });
});
