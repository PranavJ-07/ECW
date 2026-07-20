import { ClubNotFoundError } from '../../../domain/errors/club.errors';
import { BudgetClosedError, BudgetNotFoundError } from '../../../domain/errors/budget.errors';
import { ClubBudget } from '../../../domain/entities/budget.entity';
import { BudgetStatus } from '../../../domain/enums/budget.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IBudgetRepository } from '../../../domain/interfaces/budget.repository.interface';
import { IClubRepository } from '../../../domain/interfaces/club.repository.interface';
import { BudgetAuthorizationService } from '../services/budget-authorization.service';

export interface CloseBudgetInput {
  collegeId: string;
  clubSlug: string;
  budgetId: string;
  actorId: string;
  actorRoles: UserRole[];
}

export class CloseBudgetUseCase {
  constructor(
    private readonly budgetRepository: IBudgetRepository,
    private readonly clubRepository: IClubRepository,
    private readonly budgetAuthService: BudgetAuthorizationService,
  ) {}

  async execute(input: CloseBudgetInput): Promise<ClubBudget> {
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
      throw new BudgetClosedError('Budget is already closed');
    }

    return this.budgetRepository.close(input.collegeId, input.budgetId, input.actorId);
  }
}
