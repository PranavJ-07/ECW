export type BudgetStatus = 'draft' | 'active' | 'closed';
export type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';

export interface BudgetSummary {
  id: string;
  collegeId: string;
  clubId: string;
  name: string;
  fiscalYear: number;
  term?: string;
  allocatedAmountCents: number;
  currency: string;
  status: BudgetStatus;
  totalSpentCents: number;
  totalApprovedCents: number;
  totalPendingCents: number;
  remainingCents: number;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  amountCents: number;
  currency: string;
  category: string;
  status: ExpenseStatus;
  expenseDate: string;
}
