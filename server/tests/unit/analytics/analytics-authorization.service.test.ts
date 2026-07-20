import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnalyticsAuthorizationService } from '../../../src/application/analytics/services/analytics-authorization.service';
import { ForbiddenError } from '../../../src/domain/errors';
import { UserRole } from '../../../src/domain/enums/user-role.enum';
import { IMembershipRepository } from '../../../src/domain/interfaces/membership.repository.interface';

function mockMembershipRepo(): IMembershipRepository {
  return {
    isActiveOfficer: vi.fn(),
    isActivePresident: vi.fn(),
    getActiveRole: vi.fn(),
    hasActiveMembership: vi.fn(),
  };
}

describe('AnalyticsAuthorizationService', () => {
  let membershipRepository: IMembershipRepository;
  let service: AnalyticsAuthorizationService;

  beforeEach(() => {
    membershipRepository = mockMembershipRepo();
    service = new AnalyticsAuthorizationService(membershipRepository);
  });

  it('allows college admin to view college analytics', () => {
    expect(() =>
      service.assertCanViewCollegeAnalytics([UserRole.COLLEGE_ADMIN]),
    ).not.toThrow();
  });

  it('denies student from college analytics', () => {
    expect(() => service.assertCanViewCollegeAnalytics([UserRole.STUDENT])).toThrow(
      ForbiddenError,
    );
  });

  it('allows club officer to view club analytics', async () => {
    vi.mocked(membershipRepository.isActiveOfficer).mockResolvedValue(true);

    await expect(
      service.assertCanViewClubAnalytics('club1', 'user1', [UserRole.STUDENT]),
    ).resolves.toBeUndefined();
  });

  it('denies regular member from club analytics', async () => {
    vi.mocked(membershipRepository.isActiveOfficer).mockResolvedValue(false);

    await expect(
      service.assertCanViewClubAnalytics('club1', 'user1', [UserRole.STUDENT]),
    ).rejects.toThrow(ForbiddenError);
  });
});
