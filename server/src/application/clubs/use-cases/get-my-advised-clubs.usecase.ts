import { ForbiddenError } from '../../../domain/errors';
import { ClubSummary } from '../../../domain/entities/club.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IClubRepository } from '../../../domain/interfaces/club.repository.interface';

export interface GetMyAdvisedClubsInput {
  collegeId: string;
  userId: string;
  actorRoles: UserRole[];
}

/**
 * Returns active clubs where the authenticated user is the faculty advisor.
 */
export class GetMyAdvisedClubsUseCase {
  constructor(private readonly clubRepository: IClubRepository) {}

  async execute(input: GetMyAdvisedClubsInput): Promise<ClubSummary[]> {
    if (!input.actorRoles.includes(UserRole.FACULTY)) {
      throw new ForbiddenError('Faculty role required', 'FACULTY_ONLY');
    }

    return this.clubRepository.listByFacultyAdvisor(input.collegeId, input.userId);
  }
}
