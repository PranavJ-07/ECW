import { ClubNotFoundError } from '../../../domain/errors/club.errors';
import { BudgetClosedError, BudgetNotFoundError } from '../../../domain/errors/budget.errors';
import { BudgetSummary } from '../../../domain/entities/budget.entity';
import { BudgetStatus } from '../../../domain/enums/budget.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IBudgetRepository } from '../../../domain/interfaces/budget.repository.interface';
import { IClubRepository } from '../../../domain/interfaces/club.repository.interface';
import { BudgetAuthorizationService } from '../services/budget-authorization.service';
import { BudgetCalculationService } from '../services/budget-calculation.service';

export interface UpdateBudgetInput {
  collegeId: string;
  clubSlug: string;
  budgetId: string;
  name?: string;
  term?: string;
  allocatedAmountCents?: number;
  notes?: string;
  actorId: string;
  actorRoles: UserRole[];
}

export class UpdateBudgetUseCase {
  constructor(
    private readonly budgetRepository: IBudgetRepository,
    private readonly clubRepository: IClubRepository,
    private readonly budgetAuthService: BudgetAuthorizationService,
    private readonly budgetCalculationService: BudgetCalculationService,
  ) {}

  async execute(input: UpdateBudgetInput): Promise<BudgetSummary> {
    const club = await this.clubRepository.findBySlug(input.collegeId, input.clubSlug);

    if (!club || club.isDeleted) {
      throw new ClubNotFoundError();
    }

    await this.budgetAuthService.assertCanManageBudget(club.id, input.actorId, input.actorRoles);

    const existing = await this.budgetRepository.findById(input.collegeId, input.budgetId);

    if (!existing || existing.clubId !== club.id) {
      throw new BudgetNotFoundError();
    }

    if (existing.status === BudgetStatus.CLOSED) {
      throw new BudgetClosedError();
    }

    const budget = await this.budgetRepository.update(input.collegeId, input.budgetId, {
      name: input.name,
      term: input.term,
      allocatedAmountCents: input.allocatedAmountCents,
      notes: input.notes,
      updatedBy: input.actorId,
    });

    const totals = await this.budgetRepository.getExpenseTotals(budget.id);
    return this.budgetCalculationService.buildSummary(budget, totals);
  }
}
