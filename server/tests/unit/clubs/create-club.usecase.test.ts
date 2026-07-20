import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateClubUseCase } from '../../../src/application/clubs/use-cases/create-club.usecase';
import { ClubSlugExistsError } from '../../../src/domain/errors/club.errors';
import { ClubCategory, ClubStatus, ClubVisibility } from '../../../src/domain/enums/club.enum';
import { IClubRepository } from '../../../src/domain/interfaces/club.repository.interface';
import { ICollegeRepository } from '../../../src/domain/interfaces/college.repository.interface';

const mockClub = {
  id: 'club1',
  collegeId: 'college1',
  name: 'Robotics Club',
  slug: 'robotics-club',
  category: ClubCategory.TECH,
  tags: [],
  status: ClubStatus.ACTIVE,
  visibility: ClubVisibility.COLLEGE_ONLY,
  memberCount: 0,
  officerCount: 0,
  createdBy: 'user1',
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('CreateClubUseCase', () => {
  let clubRepository: {
    findBySlug: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    slugExists: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    archive: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    countActiveByCollege: ReturnType<typeof vi.fn>;
  };
  let collegeRepository: {
    findById: ReturnType<typeof vi.fn>;
    findBySlug: ReturnType<typeof vi.fn>;
  };
  let useCase: CreateClubUseCase;

  beforeEach(() => {
    clubRepository = {
      findBySlug: vi.fn(),
      findById: vi.fn(),
      slugExists: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      archive: vi.fn(),
      list: vi.fn(),
      countActiveByCollege: vi.fn(),
    };
    collegeRepository = {
      findById: vi.fn(),
      findBySlug: vi.fn(),
    };
    useCase = new CreateClubUseCase(clubRepository as unknown as IClubRepository, collegeRepository as unknown as ICollegeRepository);
  });

  it('creates a club when college exists and slug is unique', async () => {
    collegeRepository.findById.mockResolvedValue({
      id: 'college1',
      name: 'MIT',
      slug: 'mit',
      allowedEmailDomains: ['mit.edu'],
      isActive: true,
    });
    clubRepository.slugExists.mockResolvedValue(false);
    clubRepository.create.mockResolvedValue(mockClub);

    const result = await useCase.execute({
      collegeSlug: 'mit',
      collegeId: 'college1',
      name: 'Robotics Club',
      slug: 'robotics-club',
      category: ClubCategory.TECH,
      createdBy: 'user1',
    });

    expect(result.slug).toBe('robotics-club');
    expect(clubRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'robotics-club', collegeId: 'college1' }),
    );
  });

  it('throws ClubSlugExistsError when slug is taken', async () => {
    collegeRepository.findById.mockResolvedValue({
      id: 'college1',
      name: 'MIT',
      slug: 'mit',
      allowedEmailDomains: ['mit.edu'],
      isActive: true,
    });
    clubRepository.slugExists.mockResolvedValue(true);

    await expect(
      useCase.execute({
        collegeSlug: 'mit',
        collegeId: 'college1',
        name: 'Robotics Club',
        slug: 'robotics-club',
        category: ClubCategory.TECH,
        createdBy: 'user1',
      }),
    ).rejects.toThrow(ClubSlugExistsError);
  });
});
