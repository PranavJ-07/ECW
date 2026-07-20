import { describe, it, expect } from 'vitest';
import { BudgetCalculationService } from '../../../src/application/budgets/services/budget-calculation.service';
import { ClubBudget } from '../../../src/domain/entities/budget.entity';

const baseBudget: ClubBudget = {
  id: 'budget1',
  collegeId: 'college1',
  clubId: 'club1',
  name: 'Fall 2026',
  fiscalYear: 2026,
  allocatedAmountCents: 100_000,
  currency: 'USD',
  status: 'active' as import('../../../src/domain/enums/budget.enum').BudgetStatus,
  createdBy: 'user1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('BudgetCalculationService', () => {
  const service = new BudgetCalculationService();

  it('builds summary with remaining balance', () => {
    const summary = service.buildSummary(baseBudget, {
      spentCents: 20_000,
      approvedCents: 30_000,
      pendingCents: 10_000,
    });

    expect(summary.remainingCents).toBe(40_000);
    expect(summary.totalSpentCents).toBe(20_000);
  });

  it('detects over-allocation', () => {
    const exceeds = service.wouldExceedBudget(
      100_000,
      { spentCents: 50_000, approvedCents: 30_000, pendingCents: 10_000 },
      15_000,
    );

    expect(exceeds).toBe(true);
  });

  it('allows expense within allocation', () => {
    const exceeds = service.wouldExceedBudget(
      100_000,
      { spentCents: 20_000, approvedCents: 20_000, pendingCents: 10_000 },
      40_000,
    );

    expect(exceeds).toBe(false);
  });
});
