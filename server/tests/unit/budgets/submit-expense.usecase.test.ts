import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SubmitExpenseUseCase } from '../../../src/application/budgets/use-cases/expense-workflow.usecase';
import { BudgetAuthorizationService } from '../../../src/application/budgets/services/budget-authorization.service';
import { BudgetCalculationService } from '../../../src/application/budgets/services/budget-calculation.service';
import { BudgetOverAllocationError } from '../../../src/domain/errors/budget.errors';
import { ClubCategory, ClubStatus, ClubVisibility } from '../../../src/domain/enums/club.enum';
import { BudgetStatus, ExpenseCategory, ExpenseStatus } from '../../../src/domain/enums/budget.enum';
import { UserRole } from '../../../src/domain/enums/user-role.enum';
import { IBudgetRepository, IExpenseRepository } from '../../../src/domain/interfaces/budget.repository.interface';
import { IClubRepository } from '../../../src/domain/interfaces/club.repository.interface';

const mockClub = {
  id: 'club1',
  collegeId: 'college1',
  name: 'Robotics',
  slug: 'robotics-club',
  category: ClubCategory.TECH,
  tags: [],
  status: ClubStatus.ACTIVE,
  visibility: ClubVisibility.COLLEGE_ONLY,
  memberCount: 5,
  officerCount: 2,
  createdBy: 'u1',
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function mockExpenseRepo(): IExpenseRepository {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
    submit: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
    markPaid: vi.fn(),
  };
}

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

describe('SubmitExpenseUseCase', () => {
  let useCase: SubmitExpenseUseCase;
  let expenseRepository: IExpenseRepository;
  let budgetRepository: IBudgetRepository;
  let clubRepository: IClubRepository;

  beforeEach(() => {
    expenseRepository = mockExpenseRepo();
    budgetRepository = mockBudgetRepo();
    clubRepository = mockClubRepo();
    useCase = new SubmitExpenseUseCase(
      expenseRepository,
      budgetRepository,
      clubRepository,
      { assertCanSubmitExpense: vi.fn().mockResolvedValue(undefined) } as unknown as BudgetAuthorizationService,
      new BudgetCalculationService(),
    );
  });

  it('submits draft expense when within budget', async () => {
    vi.mocked(clubRepository.findBySlug).mockResolvedValue(mockClub);

    vi.mocked(budgetRepository.findById).mockResolvedValue({
      id: 'budget1',
      collegeId: 'college1',
      clubId: 'club1',
      name: 'Fall 2026',
      fiscalYear: 2026,
      allocatedAmountCents: 100_000,
      currency: 'USD',
      status: BudgetStatus.ACTIVE,
      createdBy: 'u1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(expenseRepository.findById).mockResolvedValue({
      id: 'exp1',
      collegeId: 'college1',
      clubId: 'club1',
      budgetId: 'budget1',
      title: 'Venue',
      category: ExpenseCategory.VENUE,
      amountCents: 20_000,
      currency: 'USD',
      expenseDate: new Date(),
      status: ExpenseStatus.DRAFT,
      createdBy: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(budgetRepository.getExpenseTotals).mockResolvedValue({
      spentCents: 10_000,
      approvedCents: 20_000,
      pendingCents: 30_000,
    });

    vi.mocked(expenseRepository.submit).mockResolvedValue({
      id: 'exp1',
      collegeId: 'college1',
      clubId: 'club1',
      budgetId: 'budget1',
      title: 'Venue',
      category: ExpenseCategory.VENUE,
      amountCents: 20_000,
      currency: 'USD',
      expenseDate: new Date(),
      status: ExpenseStatus.SUBMITTED,
      createdBy: 'user1',
      submittedBy: 'user1',
      submittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute({
      collegeId: 'college1',
      clubSlug: 'robotics-club',
      budgetId: 'budget1',
      expenseId: 'exp1',
      actorId: 'user1',
      actorRoles: [UserRole.STUDENT],
    });

    expect(result.status).toBe(ExpenseStatus.SUBMITTED);
  });

  it('rejects submit when it would exceed budget', async () => {
    vi.mocked(clubRepository.findBySlug).mockResolvedValue(mockClub);

    vi.mocked(budgetRepository.findById).mockResolvedValue({
      id: 'budget1',
      collegeId: 'college1',
      clubId: 'club1',
      name: 'Fall 2026',
      fiscalYear: 2026,
      allocatedAmountCents: 100_000,
      currency: 'USD',
      status: BudgetStatus.ACTIVE,
      createdBy: 'u1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(expenseRepository.findById).mockResolvedValue({
      id: 'exp1',
      collegeId: 'college1',
      clubId: 'club1',
      budgetId: 'budget1',
      title: 'Venue',
      category: ExpenseCategory.VENUE,
      amountCents: 50_000,
      currency: 'USD',
      expenseDate: new Date(),
      status: ExpenseStatus.DRAFT,
      createdBy: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(budgetRepository.getExpenseTotals).mockResolvedValue({
      spentCents: 40_000,
      approvedCents: 30_000,
      pendingCents: 20_000,
    });

    await expect(
      useCase.execute({
        collegeId: 'college1',
        clubSlug: 'robotics-club',
        budgetId: 'budget1',
        expenseId: 'exp1',
        actorId: 'user1',
        actorRoles: [UserRole.STUDENT],
      }),
    ).rejects.toThrow(BudgetOverAllocationError);
  });
});
