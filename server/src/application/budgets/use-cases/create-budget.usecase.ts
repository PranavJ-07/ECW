import { ClubArchivedError, ClubNotFoundError } from '../../../domain/errors/club.errors';
import { BudgetSummary } from '../../../domain/entities/budget.entity';
import { ClubStatus } from '../../../domain/enums/club.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IBudgetRepository } from '../../../domain/interfaces/budget.repository.interface';
import { IClubRepository } from '../../../domain/interfaces/club.repository.interface';
import { BudgetAuthorizationService } from '../services/budget-authorization.service';
import { BudgetCalculationService } from '../services/budget-calculation.service';

export interface CreateBudgetInput {
  collegeId: string;
  clubSlug: string;
  name: string;
  fiscalYear: number;
  term?: string;
  allocatedAmountCents: number;
  currency?: string;
  notes?: string;
  actorId: string;
  actorRoles: UserRole[];
}

export class CreateBudgetUseCase {
  constructor(
    private readonly budgetRepository: IBudgetRepository,
    private readonly clubRepository: IClubRepository,
    private readonly budgetAuthService: BudgetAuthorizationService,
    private readonly budgetCalculationService: BudgetCalculationService,
  ) {}

  async execute(input: CreateBudgetInput): Promise<BudgetSummary> {
    const club = await this.clubRepository.findBySlug(input.collegeId, input.clubSlug);

    if (!club || club.isDeleted) {
      throw new ClubNotFoundError();
    }

    if (club.status === ClubStatus.ARCHIVED) {
      throw new ClubArchivedError();
    }

    await this.budgetAuthService.assertCanManageBudget(club.id, input.actorId, input.actorRoles);

    const budget = await this.budgetRepository.create({
      collegeId: input.collegeId,
      clubId: club.id,
      name: input.name,
      fiscalYear: input.fiscalYear,
      term: input.term,
      allocatedAmountCents: input.allocatedAmountCents,
      currency: input.currency ?? 'USD',
      notes: input.notes,
      createdBy: input.actorId,
    });

    const totals = await this.budgetRepository.getExpenseTotals(budget.id);
    return this.budgetCalculationService.buildSummary(budget, totals);
  }
}
