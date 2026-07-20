import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetMyAdvisedClubsUseCase } from '../../../src/application/clubs/use-cases/get-my-advised-clubs.usecase';
import { ForbiddenError } from '../../../src/domain/errors';
import { ClubStatus, ClubCategory } from '../../../src/domain/enums/club.enum';
import { UserRole } from '../../../src/domain/enums/user-role.enum';
import { IClubRepository } from '../../../src/domain/interfaces/club.repository.interface';

function mockClubRepo(): IClubRepository {
  return {
    findBySlug: vi.fn(),
    findById: vi.fn(),
    slugExists: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    archive: vi.fn(),
    list: vi.fn(),
    listByFacultyAdvisor: vi.fn(),
    countActiveByCollege: vi.fn(),
  };
}

describe('GetMyAdvisedClubsUseCase', () => {
  let clubRepository: IClubRepository;
  let useCase: GetMyAdvisedClubsUseCase;

  beforeEach(() => {
    clubRepository = mockClubRepo();
    useCase = new GetMyAdvisedClubsUseCase(clubRepository);
  });

  it('returns advised clubs for faculty', async () => {
    vi.mocked(clubRepository.listByFacultyAdvisor).mockResolvedValue([
      {
        id: 'club1',
        name: 'Robotics',
        slug: 'robotics',
        category: ClubCategory.TECH,
        memberCount: 30,
        status: ClubStatus.ACTIVE,
        createdAt: new Date(),
      },
    ]);

    const result = await useCase.execute({
      collegeId: 'college1',
      userId: 'faculty1',
      actorRoles: [UserRole.FACULTY],
    });

    expect(result).toHaveLength(1);
    expect(clubRepository.listByFacultyAdvisor).toHaveBeenCalledWith('college1', 'faculty1');
  });

  it('denies non-faculty users', async () => {
    await expect(
      useCase.execute({
        collegeId: 'college1',
        userId: 'student1',
        actorRoles: [UserRole.STUDENT],
      }),
    ).rejects.toThrow(ForbiddenError);
  });
});
