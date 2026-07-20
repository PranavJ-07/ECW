import { ClubNotFoundError } from '../../../domain/errors/club.errors';
import { BudgetClosedError, BudgetNotFoundError } from '../../../domain/errors/budget.errors';
import { Expense } from '../../../domain/entities/budget.entity';
import { BudgetStatus, ExpenseCategory } from '../../../domain/enums/budget.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IBudgetRepository, IExpenseRepository } from '../../../domain/interfaces/budget.repository.interface';
import { IClubRepository } from '../../../domain/interfaces/club.repository.interface';
import { BudgetAuthorizationService } from '../services/budget-authorization.service';

export interface CreateExpenseInput {
  collegeId: string;
  clubSlug: string;
  budgetId: string;
  title: string;
  description?: string;
  category: ExpenseCategory;
  amountCents: number;
  currency?: string;
  expenseDate: Date;
  receiptUrl?: string;
  eventId?: string;
  actorId: string;
  actorRoles: UserRole[];
}

export class CreateExpenseUseCase {
  constructor(
    private readonly expenseRepository: IExpenseRepository,
    private readonly budgetRepository: IBudgetRepository,
    private readonly clubRepository: IClubRepository,
    private readonly budgetAuthService: BudgetAuthorizationService,
  ) {}

  async execute(input: CreateExpenseInput): Promise<Expense> {
    const club = await this.clubRepository.findBySlug(input.collegeId, input.clubSlug);

    if (!club || club.isDeleted) {
      throw new ClubNotFoundError();
    }

    await this.budgetAuthService.assertCanCreateExpense(club.id, input.actorId, input.actorRoles);

    const budget = await this.budgetRepository.findById(input.collegeId, input.budgetId);

    if (!budget || budget.clubId !== club.id) {
      throw new BudgetNotFoundError();
    }

    if (budget.status === BudgetStatus.CLOSED) {
      throw new BudgetClosedError();
    }

    return this.expenseRepository.create({
      collegeId: input.collegeId,
      clubId: club.id,
      budgetId: budget.id,
      eventId: input.eventId,
      title: input.title,
      description: input.description,
      category: input.category,
      amountCents: input.amountCents,
      currency: input.currency ?? budget.currency,
      expenseDate: input.expenseDate,
      receiptUrl: input.receiptUrl,
      createdBy: input.actorId,
    });
  }
}
