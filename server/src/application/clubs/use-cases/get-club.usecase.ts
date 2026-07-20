import { ClubNotFoundError } from '../../../domain/errors/club.errors';
import { Club } from '../../../domain/entities/club.entity';
import { IClubRepository } from '../../../domain/interfaces/club.repository.interface';
import { IMembershipRepository } from '../../../domain/interfaces/membership.repository.interface';
import { MembershipRole } from '../../../domain/enums/club.enum';

export interface GetClubInput {
  collegeId: string;
  clubSlug: string;
  userId?: string;
}

export interface GetClubOutput extends Club {
  myMembership?: {
    role: MembershipRole;
    status: string;
  } | null;
}

/**
 * Returns full club details, optionally including the requesting user's membership.
 */
export class GetClubUseCase {
  constructor(
    private readonly clubRepository: IClubRepository,
    private readonly membershipRepository: IMembershipRepository,
  ) {}

  async execute(input: GetClubInput): Promise<GetClubOutput> {
    const club = await this.clubRepository.findBySlug(input.collegeId, input.clubSlug);

    if (!club || club.isDeleted) {
      throw new ClubNotFoundError();
    }

    let myMembership = null;

    if (input.userId) {
      const role = await this.membershipRepository.getActiveRole(club.id, input.userId);
      if (role) {
        myMembership = { role, status: 'active' };
      }
    }

    return { ...club, myMembership };
  }
}
