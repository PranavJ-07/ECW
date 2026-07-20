import { ForbiddenError } from '../../../domain/errors';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IMembershipRepository } from '../../../domain/interfaces/membership.repository.interface';

/**
 * Authorization for analytics dashboards.
 */
export class AnalyticsAuthorizationService {
  constructor(private readonly membershipRepository: IMembershipRepository) {}

  assertCanViewCollegeAnalytics(actorRoles: UserRole[]): void {
    if (!actorRoles.includes(UserRole.COLLEGE_ADMIN)) {
      throw new ForbiddenError(
        'Only college admins can view college-wide analytics',
        'ANALYTICS_ACCESS_DENIED',
      );
    }
  }

  async assertCanViewClubAnalytics(
    clubId: string,
    actorId: string,
    actorRoles: UserRole[],
  ): Promise<void> {
    if (actorRoles.includes(UserRole.COLLEGE_ADMIN)) {
      return;
    }

    const isOfficer = await this.membershipRepository.isActiveOfficer(clubId, actorId);

    if (!isOfficer) {
      throw new ForbiddenError(
        'Only club officers or college admins can view club analytics',
        'ANALYTICS_ACCESS_DENIED',
      );
    }
  }
}
