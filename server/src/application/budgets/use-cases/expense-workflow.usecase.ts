import { ClubNotFoundError } from '../../../domain/errors/club.errors';
import {
  BudgetClosedError,
  BudgetNotFoundError,
  BudgetOverAllocationError,
  ExpenseInvalidStatusError,
  ExpenseNotFoundError,
} from '../../../domain/errors/budget.errors';
import { Expense } from '../../../domain/entities/budget.entity';
import { BudgetStatus, ExpenseStatus } from '../../../domain/enums/budget.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IBudgetRepository, IExpenseRepository } from '../../../domain/interfaces/budget.repository.interface';
import { IClubRepository } from '../../../domain/interfaces/club.repository.interface';
import { BudgetAuthorizationService } from '../services/budget-authorization.service';
import { BudgetCalculationService } from '../services/budget-calculation.service';

interface ExpenseWorkflowInput {
  collegeId: string;
  clubSlug: string;
  budgetId: string;
  expenseId: string;
  actorId: string;
  actorRoles: UserRole[];
}

export interface ReviewExpenseInput extends ExpenseWorkflowInput {
  reviewNotes?: string;
}

export class SubmitExpenseUseCase {
  constructor(
    private readonly expenseRepository: IExpenseRepository,
    private readonly budgetRepository: IBudgetRepository,
    private readonly clubRepository: IClubRepository,
    private readonly budgetAuthService: BudgetAuthorizationService,
    private readonly budgetCalculationService: BudgetCalculationService,
  ) {}

  async execute(input: ExpenseWorkflowInput): Promise<Expense> {
    const { expense, club, budget } = await this.loadContext(input);

    await this.budgetAuthService.assertCanSubmitExpense(
      expense,
      club.id,
      input.actorId,
      input.actorRoles,
    );

    if (budget.status === BudgetStatus.CLOSED) {
      throw new BudgetClosedError();
    }

    const totals = await this.budgetRepository.getExpenseTotals(budget.id);

    if (
      this.budgetCalculationService.wouldExceedBudget(
        budget.allocatedAmountCents,
        totals,
        expense.amountCents,
      )
    ) {
      throw new BudgetOverAllocationError();
    }

    return this.expenseRepository.submit(input.collegeId, expense.id, input.actorId);
  }

  private async loadContext(input: ExpenseWorkflowInput) {
    const club = await this.clubRepository.findBySlug(input.collegeId, input.clubSlug);

    if (!club || club.isDeleted) {
      throw new ClubNotFoundError();
    }

    const budget = await this.budgetRepository.findById(input.collegeId, input.budgetId);

    if (!budget || budget.clubId !== club.id) {
      throw new BudgetNotFoundError();
    }

    const expense = await this.expenseRepository.findById(input.collegeId, input.expenseId);

    if (!expense || expense.budgetId !== budget.id) {
      throw new ExpenseNotFoundError();
    }

    return { club, budget, expense };
  }
}

export class ApproveExpenseUseCase {
  constructor(
    private readonly expenseRepository: IExpenseRepository,
    private readonly budgetRepository: IBudgetRepository,
    private readonly clubRepository: IClubRepository,
    private readonly budgetAuthService: BudgetAuthorizationService,
  ) {}

  async execute(input: ReviewExpenseInput): Promise<Expense> {
    const club = await this.clubRepository.findBySlug(input.collegeId, input.clubSlug);

    if (!club || club.isDeleted) {
      throw new ClubNotFoundError();
    }

    await this.budgetAuthService.assertCanApproveExpense(
      club.id,
      input.actorId,
      input.actorRoles,
    );

    const budget = await this.budgetRepository.findById(input.collegeId, input.budgetId);

    if (!budget || budget.clubId !== club.id) {
      throw new BudgetNotFoundError();
    }

    if (budget.status === BudgetStatus.CLOSED) {
      throw new BudgetClosedError();
    }

    const expense = await this.expenseRepository.findById(input.collegeId, input.expenseId);

    if (!expense || expense.budgetId !== budget.id) {
      throw new ExpenseNotFoundError();
    }

    if (expense.status !== ExpenseStatus.SUBMITTED) {
      throw new ExpenseInvalidStatusError('Only submitted expenses can be approved');
    }

    return this.expenseRepository.approve(
      input.collegeId,
      expense.id,
      input.actorId,
      input.reviewNotes,
    );
  }
}

export class RejectExpenseUseCase {
  constructor(
    private readonly expenseRepository: IExpenseRepository,
    private readonly budgetRepository: IBudgetRepository,
    private readonly clubRepository: IClubRepository,
    private readonly budgetAuthService: BudgetAuthorizationService,
  ) {}

  async execute(input: ReviewExpenseInput): Promise<Expense> {
    const club = await this.clubRepository.findBySlug(input.collegeId, input.clubSlug);

    if (!club || club.isDeleted) {
      throw new ClubNotFoundError();
    }

    await this.budgetAuthService.assertCanApproveExpense(
      club.id,
      input.actorId,
      input.actorRoles,
    );

    const budget = await this.budgetRepository.findById(input.collegeId, input.budgetId);

    if (!budget || budget.clubId !== club.id) {
      throw new BudgetNotFoundError();
    }

    const expense = await this.expenseRepository.findById(input.collegeId, input.expenseId);

    if (!expense || expense.budgetId !== budget.id) {
      throw new ExpenseNotFoundError();
    }

    if (expense.status !== ExpenseStatus.SUBMITTED) {
      throw new ExpenseInvalidStatusError('Only submitted expenses can be rejected');
    }

    return this.expenseRepository.reject(
      input.collegeId,
      expense.id,
      input.actorId,
      input.reviewNotes,
    );
  }
}

export class MarkExpensePaidUseCase {
  constructor(
    private readonly expenseRepository: IExpenseRepository,
    private readonly budgetRepository: IBudgetRepository,
    private readonly clubRepository: IClubRepository,
    private readonly budgetAuthService: BudgetAuthorizationService,
  ) {}

  async execute(input: ExpenseWorkflowInput): Promise<Expense> {
    const club = await this.clubRepository.findBySlug(input.collegeId, input.clubSlug);

    if (!club || club.isDeleted) {
      throw new ClubNotFoundError();
    }

    await this.budgetAuthService.assertCanManageBudget(club.id, input.actorId, input.actorRoles);

    const budget = await this.budgetRepository.findById(input.collegeId, input.budgetId);

    if (!budget || budget.clubId !== club.id) {
      throw new BudgetNotFoundError();
    }

    const expense = await this.expenseRepository.findById(input.collegeId, input.expenseId);

    if (!expense || expense.budgetId !== budget.id) {
      throw new ExpenseNotFoundError();
    }

    if (expense.status !== ExpenseStatus.APPROVED) {
      throw new ExpenseInvalidStatusError('Only approved expenses can be marked as paid');
    }

    return this.expenseRepository.markPaid(input.collegeId, expense.id, input.actorId);
  }
}
