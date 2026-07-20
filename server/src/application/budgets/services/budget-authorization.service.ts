import { ForbiddenError } from '../../../domain/errors';
import { MembershipRole } from '../../../domain/enums/club.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { Expense } from '../../../domain/entities/budget.entity';
import { ExpenseStatus } from '../../../domain/enums/budget.enum';
import { IMembershipRepository } from '../../../domain/interfaces/membership.repository.interface';

const FINANCE_ROLES = [MembershipRole.PRESIDENT, MembershipRole.TREASURER];

/**
 * Authorization for club budget and expense operations.
 */
export class BudgetAuthorizationService {
  constructor(private readonly membershipRepository: IMembershipRepository) {}

  async assertCanManageBudget(
    clubId: string,
    actorId: string,
    actorRoles: UserRole[],
  ): Promise<void> {
    if (actorRoles.includes(UserRole.COLLEGE_ADMIN)) {
      return;
    }

    const role = await this.membershipRepository.getActiveRole(clubId, actorId);

    if (role && FINANCE_ROLES.includes(role)) {
      return;
    }

    throw new ForbiddenError(
      'Only club president, treasurer, or college admin can manage budgets',
      'BUDGET_ACCESS_DENIED',
    );
  }

  async assertCanReadBudget(
    clubId: string,
    actorId: string,
    actorRoles: UserRole[],
  ): Promise<void> {
    if (actorRoles.includes(UserRole.COLLEGE_ADMIN)) {
      return;
    }

    const isMember = await this.membershipRepository.hasActiveMembership(clubId, actorId);

    if (!isMember) {
      throw new ForbiddenError('Club membership required to view budgets', 'BUDGET_ACCESS_DENIED');
    }
  }

  async assertCanApproveExpense(
    clubId: string,
    actorId: string,
    actorRoles: UserRole[],
  ): Promise<void> {
    return this.assertCanManageBudget(clubId, actorId, actorRoles);
  }

  async assertCanCreateExpense(
    clubId: string,
    actorId: string,
    actorRoles: UserRole[],
  ): Promise<void> {
    if (actorRoles.includes(UserRole.COLLEGE_ADMIN)) {
      return;
    }

    const isMember = await this.membershipRepository.hasActiveMembership(clubId, actorId);

    if (!isMember) {
      throw new ForbiddenError('Club membership required to create expenses', 'BUDGET_ACCESS_DENIED');
    }
  }

  async assertCanEditExpense(
    expense: Expense,
    clubId: string,
    actorId: string,
    actorRoles: UserRole[],
  ): Promise<void> {
    if (expense.status !== ExpenseStatus.DRAFT) {
      throw new ForbiddenError('Only draft expenses can be edited', 'EXPENSE_INVALID_STATUS');
    }

    if (expense.createdBy === actorId) {
      return;
    }

    await this.assertCanManageBudget(clubId, actorId, actorRoles);
  }

  async assertCanDeleteExpense(
    expense: Expense,
    clubId: string,
    actorId: string,
    actorRoles: UserRole[],
  ): Promise<void> {
    return this.assertCanEditExpense(expense, clubId, actorId, actorRoles);
  }

  async assertCanSubmitExpense(
    expense: Expense,
    clubId: string,
    actorId: string,
    actorRoles: UserRole[],
  ): Promise<void> {
    if (expense.status !== ExpenseStatus.DRAFT) {
      throw new ForbiddenError('Only draft expenses can be submitted', 'EXPENSE_INVALID_STATUS');
    }

    if (expense.createdBy === actorId) {
      return;
    }

    await this.assertCanManageBudget(clubId, actorId, actorRoles);
  }
}
