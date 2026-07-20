import { ClubNotFoundError } from '../../../domain/errors/club.errors';
import { BudgetNotFoundError } from '../../../domain/errors/budget.errors';
import { BudgetSummary } from '../../../domain/entities/budget.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IBudgetRepository } from '../../../domain/interfaces/budget.repository.interface';
import { IClubRepository } from '../../../domain/interfaces/club.repository.interface';
import { BudgetAuthorizationService } from '../services/budget-authorization.service';

export interface GetBudgetInput {
  collegeId: string;
  clubSlug: string;
  budgetId: string;
  actorId: string;
  actorRoles: UserRole[];
}

export class GetBudgetUseCase {
  constructor(
    private readonly budgetRepository: IBudgetRepository,
    private readonly clubRepository: IClubRepository,
    private readonly budgetAuthService: BudgetAuthorizationService,
  ) {}

  async execute(input: GetBudgetInput): Promise<BudgetSummary> {
    const club = await this.clubRepository.findBySlug(input.collegeId, input.clubSlug);

    if (!club || club.isDeleted) {
      throw new ClubNotFoundError();
    }

    await this.budgetAuthService.assertCanReadBudget(club.id, input.actorId, input.actorRoles);

    const budget = await this.budgetRepository.findByIdWithSummary(input.collegeId, input.budgetId);

    if (!budget || budget.clubId !== club.id) {
      throw new BudgetNotFoundError();
    }

    return budget;
  }
}
