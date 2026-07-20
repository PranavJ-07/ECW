import { ForbiddenError } from '../../../domain/errors';
import { ClubNotFoundError } from '../../../domain/errors/club.errors';
import { Club } from '../../../domain/entities/club.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IClubRepository } from '../../../domain/interfaces/club.repository.interface';
import { IMembershipRepository } from '../../../domain/interfaces/membership.repository.interface';

export interface ArchiveClubInput {
  collegeId: string;
  clubSlug: string;
  actorId: string;
  actorRoles: UserRole[];
}

/**
 * Soft-archives a club. Authorization:
 * - college_admin: any club
 * - club president: their own club
 */
export class ArchiveClubUseCase {
  constructor(
    private readonly clubRepository: IClubRepository,
    private readonly membershipRepository: IMembershipRepository,
  ) {}

  async execute(input: ArchiveClubInput): Promise<Club> {
    const club = await this.clubRepository.findBySlug(input.collegeId, input.clubSlug);

    if (!club || club.isDeleted) {
      throw new ClubNotFoundError();
    }

    await this.assertCanArchive(club.id, input.actorId, input.actorRoles);

    return this.clubRepository.archive(input.collegeId, club.id, input.actorId);
  }

  private async assertCanArchive(
    clubId: string,
    actorId: string,
    actorRoles: UserRole[],
  ): Promise<void> {
    if (actorRoles.includes(UserRole.COLLEGE_ADMIN)) {
      return;
    }

    const isPresident = await this.membershipRepository.isActivePresident(clubId, actorId);

    if (!isPresident) {
      throw new ForbiddenError(
        'Only club presidents or college admins can archive this club',
        'FORBIDDEN',
      );
    }
  }
}
