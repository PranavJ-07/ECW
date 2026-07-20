import { NotFoundError } from '../../../domain/errors';
import { ClubSlugExistsError } from '../../../domain/errors/club.errors';
import { Club } from '../../../domain/entities/club.entity';
import { ClubVisibility } from '../../../domain/enums/club.enum';
import { IClubRepository } from '../../../domain/interfaces/club.repository.interface';
import { ICollegeRepository } from '../../../domain/interfaces/college.repository.interface';

export interface CreateClubInput {
  collegeSlug: string;
  collegeId: string;
  name: string;
  slug: string;
  description?: string;
  category: import('../../../domain/enums/club.enum').ClubCategory;
  tags?: string[];
  contactEmail?: string;
  facultyAdvisorId?: string;
  visibility?: ClubVisibility;
  createdBy: string;
}

/**
 * Creates a new club within a college tenant.
 * Only college admins should reach this use case (enforced at route level).
 */
export class CreateClubUseCase {
  constructor(
    private readonly clubRepository: IClubRepository,
    private readonly collegeRepository: ICollegeRepository,
  ) {}

  async execute(input: CreateClubInput): Promise<Club> {
    const college = await this.collegeRepository.findById(input.collegeId);

    if (!college || !college.isActive) {
      throw new NotFoundError('College not found', 'COLLEGE_NOT_FOUND');
    }

    const normalizedSlug = input.slug.toLowerCase().trim();
    const slugTaken = await this.clubRepository.slugExists(input.collegeId, normalizedSlug);

    if (slugTaken) {
      throw new ClubSlugExistsError();
    }

    return this.clubRepository.create({
      collegeId: input.collegeId,
      name: input.name.trim(),
      slug: normalizedSlug,
      description: input.description?.trim(),
      category: input.category,
      tags: input.tags ?? [],
      contactEmail: input.contactEmail?.trim(),
      facultyAdvisorId: input.facultyAdvisorId,
      visibility: input.visibility ?? ClubVisibility.COLLEGE_ONLY,
      createdBy: input.createdBy,
    });
  }
}
