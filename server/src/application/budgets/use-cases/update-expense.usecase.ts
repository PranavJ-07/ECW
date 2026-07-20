import { ClubNotFoundError } from '../../../domain/errors/club.errors';
import {
  BudgetClosedError,
  BudgetNotFoundError,
  BudgetOverAllocationError,
  ExpenseNotFoundError,
} from '../../../domain/errors/budget.errors';
import { Expense } from '../../../domain/entities/budget.entity';
import { BudgetStatus, ExpenseCategory } from '../../../domain/enums/budget.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IBudgetRepository, IExpenseRepository } from '../../../domain/interfaces/budget.repository.interface';
import { IClubRepository } from '../../../domain/interfaces/club.repository.interface';
import { BudgetAuthorizationService } from '../services/budget-authorization.service';
import { BudgetCalculationService } from '../services/budget-calculation.service';

export interface UpdateExpenseInput {
  collegeId: string;
  clubSlug: string;
  budgetId: string;
  expenseId: string;
  title?: string;
  description?: string;
  category?: ExpenseCategory;
  amountCents?: number;
  expenseDate?: Date;
  receiptUrl?: string;
  eventId?: string | null;
  actorId: string;
  actorRoles: UserRole[];
}

export class UpdateExpenseUseCase {
  constructor(
    private readonly expenseRepository: IExpenseRepository,
    private readonly budgetRepository: IBudgetRepository,
    private readonly clubRepository: IClubRepository,
    private readonly budgetAuthService: BudgetAuthorizationService,
    private readonly budgetCalculationService: BudgetCalculationService,
  ) {}

  async execute(input: UpdateExpenseInput): Promise<Expense> {
    const club = await this.clubRepository.findBySlug(input.collegeId, input.clubSlug);

    if (!club || club.isDeleted) {
      throw new ClubNotFoundError();
    }

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

    await this.budgetAuthService.assertCanEditExpense(
      expense,
      club.id,
      input.actorId,
      input.actorRoles,
    );

    if (input.amountCents !== undefined && input.amountCents !== expense.amountCents) {
      const totals = await this.budgetRepository.getExpenseTotals(budget.id);

      if (
        this.budgetCalculationService.wouldExceedBudget(
          budget.allocatedAmountCents,
          totals,
          input.amountCents,
        )
      ) {
        throw new BudgetOverAllocationError();
      }
    }

    return this.expenseRepository.update(input.collegeId, input.expenseId, {
      title: input.title,
      description: input.description,
      category: input.category,
      amountCents: input.amountCents,
      expenseDate: input.expenseDate,
      receiptUrl: input.receiptUrl,
      eventId: input.eventId,
      updatedBy: input.actorId,
    });
  }
}

export interface DeleteExpenseInput {
  collegeId: string;
  clubSlug: string;
  budgetId: string;
  expenseId: string;
  actorId: string;
  actorRoles: UserRole[];
}

export class DeleteExpenseUseCase {
  constructor(
    private readonly expenseRepository: IExpenseRepository,
    private readonly budgetRepository: IBudgetRepository,
    private readonly clubRepository: IClubRepository,
    private readonly budgetAuthService: BudgetAuthorizationService,
  ) {}

  async execute(input: DeleteExpenseInput): Promise<void> {
    const club = await this.clubRepository.findBySlug(input.collegeId, input.clubSlug);

    if (!club || club.isDeleted) {
      throw new ClubNotFoundError();
    }

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

    await this.budgetAuthService.assertCanDeleteExpense(
      expense,
      club.id,
      input.actorId,
      input.actorRoles,
    );

    await this.expenseRepository.delete(input.collegeId, input.expenseId);
  }
}
