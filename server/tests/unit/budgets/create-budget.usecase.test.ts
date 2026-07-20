import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateBudgetUseCase } from '../../../src/application/budgets/use-cases/create-budget.usecase';
import { BudgetAuthorizationService } from '../../../src/application/budgets/services/budget-authorization.service';
import { BudgetCalculationService } from '../../../src/application/budgets/services/budget-calculation.service';
import { ClubCategory, ClubStatus, ClubVisibility } from '../../../src/domain/enums/club.enum';
import { BudgetStatus } from '../../../src/domain/enums/budget.enum';
import { UserRole } from '../../../src/domain/enums/user-role.enum';
import { IBudgetRepository } from '../../../src/domain/interfaces/budget.repository.interface';
import { IClubRepository } from '../../../src/domain/interfaces/club.repository.interface';

const mockClub = {
  id: 'club1',
  collegeId: 'college1',
  name: 'Robotics Club',
  slug: 'robotics-club',
  category: ClubCategory.TECH,
  tags: [],
  status: ClubStatus.ACTIVE,
  visibility: ClubVisibility.COLLEGE_ONLY,
  memberCount: 10,
  officerCount: 2,
  createdBy: 'user1',
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function mockBudgetRepo(): IBudgetRepository {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findByIdWithSummary: vi.fn(),
    update: vi.fn(),
    close: vi.fn(),
    list: vi.fn(),
    getExpenseTotals: vi.fn(),
  };
}

function mockClubRepo(): IClubRepository {
  return {
    findBySlug: vi.fn(),
    findById: vi.fn(),
    slugExists: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    archive: vi.fn(),
    list: vi.fn(),
    countActiveByCollege: vi.fn(),
  };
}

describe('CreateBudgetUseCase', () => {
  let budgetRepository: IBudgetRepository;
  let clubRepository: IClubRepository;
  let useCase: CreateBudgetUseCase;

  beforeEach(() => {
    budgetRepository = mockBudgetRepo();
    clubRepository = mockClubRepo();
    useCase = new CreateBudgetUseCase(
      budgetRepository,
      clubRepository,
      { assertCanManageBudget: vi.fn().mockResolvedValue(undefined) } as unknown as BudgetAuthorizationService,
      new BudgetCalculationService(),
    );
  });

  it('creates a budget for an active club', async () => {
    vi.mocked(clubRepository.findBySlug).mockResolvedValue(mockClub);
    vi.mocked(budgetRepository.create).mockResolvedValue({
      id: 'budget1',
      collegeId: 'college1',
      clubId: 'club1',
      name: 'Fall 2026',
      fiscalYear: 2026,
      allocatedAmountCents: 500_000,
      currency: 'USD',
      status: BudgetStatus.ACTIVE,
      createdBy: 'treasurer1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(budgetRepository.getExpenseTotals).mockResolvedValue({
      spentCents: 0,
      approvedCents: 0,
      pendingCents: 0,
    });

    const result = await useCase.execute({
      collegeId: 'college1',
      clubSlug: 'robotics-club',
      name: 'Fall 2026',
      fiscalYear: 2026,
      allocatedAmountCents: 500_000,
      actorId: 'treasurer1',
      actorRoles: [UserRole.STUDENT],
    });

    expect(result.name).toBe('Fall 2026');
    expect(result.remainingCents).toBe(500_000);
  });
});
