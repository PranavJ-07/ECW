import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetMyClubsUseCase } from '../../../src/application/memberships/use-cases/get-my-clubs.usecase';
import { IMembershipRepository } from '../../../src/domain/interfaces/membership.repository.interface';
import { MembershipRole, MembershipStatus } from '../../../src/domain/enums/club.enum';

function mockMembershipRepo(): IMembershipRepository {
  return {
    isActiveOfficer: vi.fn(),
    isActivePresident: vi.fn(),
    getActiveRole: vi.fn(),
    hasActiveMembership: vi.fn(),
    listOfficerClubsByUser: vi.fn(),
  };
}

describe('GetMyClubsUseCase', () => {
  let membershipRepository: IMembershipRepository;
  let useCase: GetMyClubsUseCase;

  beforeEach(() => {
    membershipRepository = mockMembershipRepo();
    useCase = new GetMyClubsUseCase(membershipRepository);
  });

  it('returns officer clubs for the user', async () => {
    vi.mocked(membershipRepository.listOfficerClubsByUser).mockResolvedValue([
      {
        clubId: 'club1',
        name: 'Robotics',
        slug: 'robotics',
        memberCount: 40,
        role: MembershipRole.PRESIDENT,
        status: MembershipStatus.ACTIVE,
      },
    ]);

    const result = await useCase.execute({
      collegeId: 'college1',
      userId: 'user1',
    });

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('robotics');
  });
});
