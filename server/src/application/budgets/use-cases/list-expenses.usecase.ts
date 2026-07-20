import { ClubNotFoundError } from '../../../domain/errors/club.errors';
import { BudgetNotFoundError } from '../../../domain/errors/budget.errors';
import { ExpenseCategory, ExpenseStatus } from '../../../domain/enums/budget.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import {
  IBudgetRepository,
  IExpenseRepository,
  PaginatedExpenses,
} from '../../../domain/interfaces/budget.repository.interface';
import { IClubRepository } from '../../../domain/interfaces/club.repository.interface';
import { BudgetAuthorizationService } from '../services/budget-authorization.service';

export interface ListExpensesInput {
  collegeId: string;
  clubSlug: string;
  budgetId: string;
  status?: ExpenseStatus;
  category?: ExpenseCategory;
  eventId?: string;
  page?: number;
  limit?: number;
  actorId: string;
  actorRoles: UserRole[];
}

export class ListExpensesUseCase {
  constructor(
    private readonly expenseRepository: IExpenseRepository,
    private readonly budgetRepository: IBudgetRepository,
    private readonly clubRepository: IClubRepository,
    private readonly budgetAuthService: BudgetAuthorizationService,
  ) {}

  async execute(input: ListExpensesInput): Promise<PaginatedExpenses> {
    const club = await this.clubRepository.findBySlug(input.collegeId, input.clubSlug);

    if (!club || club.isDeleted) {
      throw new ClubNotFoundError();
    }

    await this.budgetAuthService.assertCanReadBudget(club.id, input.actorId, input.actorRoles);

    const budget = await this.budgetRepository.findById(input.collegeId, input.budgetId);

    if (!budget || budget.clubId !== club.id) {
      throw new BudgetNotFoundError();
    }

    const page = input.page ?? 1;
    const limit = Math.min(input.limit ?? 50, 100);

    return this.expenseRepository.list({
      collegeId: input.collegeId,
      budgetId: budget.id,
      status: input.status,
      category: input.category,
      eventId: input.eventId,
      page,
      limit,
    });
  }
}
