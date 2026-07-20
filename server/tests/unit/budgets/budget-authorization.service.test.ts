import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BudgetAuthorizationService } from '../../../src/application/budgets/services/budget-authorization.service';
import { ForbiddenError } from '../../../src/domain/errors';
import { MembershipRole } from '../../../src/domain/enums/club.enum';
import { UserRole } from '../../../src/domain/enums/user-role.enum';
import { ExpenseStatus } from '../../../src/domain/enums/budget.enum';
import { IMembershipRepository } from '../../../src/domain/interfaces/membership.repository.interface';

function mockMembershipRepo(): IMembershipRepository {
  return {
    isActiveOfficer: vi.fn(),
    isActivePresident: vi.fn(),
    getActiveRole: vi.fn(),
    hasActiveMembership: vi.fn(),
  };
}

describe('BudgetAuthorizationService', () => {
  let membershipRepository: IMembershipRepository;
  let service: BudgetAuthorizationService;

  beforeEach(() => {
    membershipRepository = mockMembershipRepo();
    service = new BudgetAuthorizationService(membershipRepository);
  });

  it('allows college admin to manage budget', async () => {
    await expect(
      service.assertCanManageBudget('club1', 'admin1', [UserRole.COLLEGE_ADMIN]),
    ).resolves.toBeUndefined();
  });

  it('allows treasurer to manage budget', async () => {
    vi.mocked(membershipRepository.getActiveRole).mockResolvedValue(MembershipRole.TREASURER);

    await expect(
      service.assertCanManageBudget('club1', 'user1', [UserRole.STUDENT]),
    ).resolves.toBeUndefined();
  });

  it('denies regular member from managing budget', async () => {
    vi.mocked(membershipRepository.getActiveRole).mockResolvedValue(MembershipRole.MEMBER);

    await expect(
      service.assertCanManageBudget('club1', 'user1', [UserRole.STUDENT]),
    ).rejects.toThrow(ForbiddenError);
  });

  it('allows active member to read budget', async () => {
    vi.mocked(membershipRepository.hasActiveMembership).mockResolvedValue(true);

    await expect(
      service.assertCanReadBudget('club1', 'user1', [UserRole.STUDENT]),
    ).resolves.toBeUndefined();
  });

  it('allows expense owner to edit draft expense', async () => {
    await expect(
      service.assertCanEditExpense(
        {
          id: 'exp1',
          collegeId: 'c1',
          clubId: 'club1',
          budgetId: 'b1',
          userId: 'user1',
          title: 'Snacks',
          category: 'catering' as import('../../../src/domain/enums/budget.enum').ExpenseCategory,
          amountCents: 5000,
          currency: 'USD',
          expenseDate: new Date(),
          status: ExpenseStatus.DRAFT,
          createdBy: 'user1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        'club1',
        'user1',
        [UserRole.STUDENT],
      ),
    ).resolves.toBeUndefined();
  });
});
