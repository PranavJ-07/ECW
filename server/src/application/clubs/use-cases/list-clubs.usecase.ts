import { ClubCategory, ClubStatus } from '../../../domain/enums/club.enum';
import { IClubRepository, PaginatedClubs } from '../../../domain/interfaces/club.repository.interface';

export interface ListClubsInput {
  collegeId: string;
  category?: ClubCategory;
  status?: ClubStatus;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

/**
 * Returns a paginated, filterable list of clubs within a college.
 */
export class ListClubsUseCase {
  constructor(private readonly clubRepository: IClubRepository) {}

  async execute(input: ListClubsInput): Promise<PaginatedClubs> {
    const page = input.page ?? 1;
    const limit = Math.min(input.limit ?? 20, 100);

    return this.clubRepository.list({
      collegeId: input.collegeId,
      category: input.category,
      status: input.status ?? ClubStatus.ACTIVE,
      search: input.search?.trim(),
      page,
      limit,
      sort: input.sort ?? '-memberCount',
    });
  }
}
