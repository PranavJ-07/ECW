import { ClubNotFoundError } from '../../../domain/errors/club.errors';
import { BudgetStatus } from '../../../domain/enums/budget.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IBudgetRepository, PaginatedBudgets } from '../../../domain/interfaces/budget.repository.interface';
import { IClubRepository } from '../../../domain/interfaces/club.repository.interface';
import { BudgetAuthorizationService } from '../services/budget-authorization.service';

export interface ListClubBudgetsInput {
  collegeId: string;
  clubSlug: string;
  status?: BudgetStatus;
  page?: number;
  limit?: number;
  actorId: string;
  actorRoles: UserRole[];
}

export class ListClubBudgetsUseCase {
  constructor(
    private readonly budgetRepository: IBudgetRepository,
    private readonly clubRepository: IClubRepository,
    private readonly budgetAuthService: BudgetAuthorizationService,
  ) {}

  async execute(input: ListClubBudgetsInput): Promise<PaginatedBudgets> {
    const club = await this.clubRepository.findBySlug(input.collegeId, input.clubSlug);

    if (!club || club.isDeleted) {
      throw new ClubNotFoundError();
    }

    await this.budgetAuthService.assertCanReadBudget(club.id, input.actorId, input.actorRoles);

    const page = input.page ?? 1;
    const limit = Math.min(input.limit ?? 20, 100);

    return this.budgetRepository.list({
      collegeId: input.collegeId,
      clubId: club.id,
      status: input.status,
      page,
      limit,
    });
  }
}
