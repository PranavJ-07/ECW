import { ForbiddenError } from '../../../domain/errors';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IMembershipRepository } from '../../../domain/interfaces/membership.repository.interface';

/**
 * Shared authorization for event management actions.
 * college_admin bypasses; club officers must belong to the owning club.
 */
export class EventAuthorizationService {
  constructor(private readonly membershipRepository: IMembershipRepository) {}

  async assertCanManage(clubId: string, actorId: string, actorRoles: UserRole[]): Promise<void> {
    if (actorRoles.includes(UserRole.COLLEGE_ADMIN)) {
      return;
    }

    const isOfficer = await this.membershipRepository.isActiveOfficer(clubId, actorId);

    if (!isOfficer) {
      throw new ForbiddenError(
        'Only club officers or college admins can manage this event',
        'FORBIDDEN',
      );
    }
  }

  async canViewMembersOnlyEvent(clubId: string, userId: string, actorRoles: UserRole[]): Promise<boolean> {
    if (actorRoles.includes(UserRole.COLLEGE_ADMIN)) {
      return true;
    }

    const role = await this.membershipRepository.getActiveRole(clubId, userId);
    return role !== null;
  }
}
