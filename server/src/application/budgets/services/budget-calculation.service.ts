import { ClubBudget } from '../../../domain/entities/budget.entity';
import { ExpenseTotals } from '../../../domain/interfaces/budget.repository.interface';

/**
 * Computes budget summary figures from allocation and expense totals.
 */
export class BudgetCalculationService {
  buildSummary(budget: ClubBudget, totals: ExpenseTotals) {
    const remainingCents =
      budget.allocatedAmountCents -
      totals.spentCents -
      totals.approvedCents -
      totals.pendingCents;

    return {
      ...budget,
      totalSpentCents: totals.spentCents,
      totalApprovedCents: totals.approvedCents,
      totalPendingCents: totals.pendingCents,
      remainingCents,
    };
  }

  wouldExceedBudget(
    allocatedAmountCents: number,
    totals: ExpenseTotals,
    additionalCents: number,
  ): boolean {
    const committed = totals.spentCents + totals.approvedCents + totals.pendingCents;
    return committed + additionalCents > allocatedAmountCents;
  }
}

export const budgetCalculationService = new BudgetCalculationService();
