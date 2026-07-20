import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateClubUseCase } from '../../../src/application/clubs/use-cases/update-club.usecase';
import { ForbiddenError } from '../../../src/domain/errors';
import { ClubArchivedError } from '../../../src/domain/errors/club.errors';
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

describe('UpdateClubUseCase', () => {
  let clubRepository: IClubRepository;
  let membershipRepository: IMembershipRepository;
  let useCase: UpdateClubUseCase;

  beforeEach(() => {
    clubRepository = mockClubRepo();
    membershipRepository = mockMembershipRepo();
    useCase = new UpdateClubUseCase(clubRepository, membershipRepository);
  });

  it('allows college_admin to update any club', async () => {
    vi.mocked(clubRepository.findBySlug).mockResolvedValue(mockClub);
    vi.mocked(clubRepository.update).mockResolvedValue({ ...mockClub, name: 'Updated Name' });

    const result = await useCase.execute({
      collegeId: 'college1',
      clubSlug: 'robotics-club',
      data: { name: 'Updated Name' },
      actorId: 'admin1',
      actorRoles: [UserRole.COLLEGE_ADMIN],
    });

    expect(result.name).toBe('Updated Name');
    expect(membershipRepository.isActiveOfficer).not.toHaveBeenCalled();
  });

  it('allows club officer to update their club', async () => {
    vi.mocked(clubRepository.findBySlug).mockResolvedValue(mockClub);
    vi.mocked(membershipRepository.isActiveOfficer).mockResolvedValue(true);
    vi.mocked(clubRepository.update).mockResolvedValue({ ...mockClub, description: 'New desc' });

    await useCase.execute({
      collegeId: 'college1',
      clubSlug: 'robotics-club',
      data: { description: 'New desc' },
      actorId: 'officer1',
      actorRoles: [UserRole.STUDENT],
    });

    expect(membershipRepository.isActiveOfficer).toHaveBeenCalledWith('club1', 'officer1');
  });

  it('denies regular student from updating club', async () => {
    vi.mocked(clubRepository.findBySlug).mockResolvedValue(mockClub);
    vi.mocked(membershipRepository.isActiveOfficer).mockResolvedValue(false);

    await expect(
      useCase.execute({
        collegeId: 'college1',
        clubSlug: 'robotics-club',
        data: { name: 'Hacked' },
        actorId: 'student1',
        actorRoles: [UserRole.STUDENT],
      }),
    ).rejects.toThrow(ForbiddenError);
  });

  it('denies update on archived club', async () => {
    vi.mocked(clubRepository.findBySlug).mockResolvedValue({
      ...mockClub,
      status: ClubStatus.ARCHIVED,
    });

    await expect(
      useCase.execute({
        collegeId: 'college1',
        clubSlug: 'robotics-club',
        data: { name: 'Updated' },
        actorId: 'admin1',
        actorRoles: [UserRole.COLLEGE_ADMIN],
      }),
    ).rejects.toThrow(ClubArchivedError);
  });
});
