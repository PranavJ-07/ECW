import { ForbiddenError } from '../../../domain/errors';
import { ClubArchivedError, ClubNotFoundError } from '../../../domain/errors/club.errors';
import { Club } from '../../../domain/entities/club.entity';
import { ClubStatus } from '../../../domain/enums/club.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import {
  IClubRepository,
  UpdateClubData,
} from '../../../domain/interfaces/club.repository.interface';
import { IMembershipRepository } from '../../../domain/interfaces/membership.repository.interface';

export interface UpdateClubInput {
  collegeId: string;
  clubSlug: string;
  data: Omit<UpdateClubData, 'updatedBy'>;
  actorId: string;
  actorRoles: UserRole[];
}

/**
 * Updates a club. Authorization:
 * - college_admin: any club in their college
 * - club officer/president: only their own club
 */
export class UpdateClubUseCase {
  constructor(
    private readonly clubRepository: IClubRepository,
    private readonly membershipRepository: IMembershipRepository,
  ) {}

  async execute(input: UpdateClubInput): Promise<Club> {
    const club = await this.clubRepository.findBySlug(input.collegeId, input.clubSlug);

    if (!club || club.isDeleted) {
      throw new ClubNotFoundError();
    }

    if (club.status === ClubStatus.ARCHIVED) {
      throw new ClubArchivedError();
    }

    await this.assertCanManage(club.id, input.actorId, input.actorRoles);

    return this.clubRepository.update(input.collegeId, club.id, {
      ...input.data,
      updatedBy: input.actorId,
    });
  }

  private async assertCanManage(
    clubId: string,
    actorId: string,
    actorRoles: UserRole[],
  ): Promise<void> {
    if (actorRoles.includes(UserRole.COLLEGE_ADMIN)) {
      return;
    }

    const isOfficer = await this.membershipRepository.isActiveOfficer(clubId, actorId);

    if (!isOfficer) {
      throw new ForbiddenError('Only club officers or college admins can update this club', 'FORBIDDEN');
    }
  }
}
