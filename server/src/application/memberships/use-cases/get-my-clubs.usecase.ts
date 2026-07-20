import { IMembershipRepository } from '../../../domain/interfaces/membership.repository.interface';
import { UserClubMembership } from '../../../domain/entities/membership.entity';

export interface GetMyClubsInput {
  collegeId: string;
  userId: string;
  officerOnly?: boolean;
}

/**
 * Returns clubs the authenticated user belongs to.
 * Default: officer/president/treasurer roles only (club dashboard access).
 */
export class GetMyClubsUseCase {
  constructor(private readonly membershipRepository: IMembershipRepository) {}

  async execute(input: GetMyClubsInput): Promise<UserClubMembership[]> {
    if (input.officerOnly === false) {
      // Future: list all memberships when membership module ships.
      return this.membershipRepository.listOfficerClubsByUser(input.collegeId, input.userId);
    }

    return this.membershipRepository.listOfficerClubsByUser(input.collegeId, input.userId);
  }
}
