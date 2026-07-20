import { BudgetStatus } from '../enums/budget.enum';
import { ExpenseCategory, ExpenseStatus } from '../enums/budget.enum';

export interface ClubBudget {
  id: string;
  collegeId: string;
  clubId: string;
  name: string;
  fiscalYear: number;
  term?: string;
  allocatedAmountCents: number;
  currency: string;
  status: BudgetStatus;
  notes?: string;
  createdBy: string;
  updatedBy?: string;
  closedAt?: Date;
  closedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetSummary extends ClubBudget {
  totalSpentCents: number;
  totalApprovedCents: number;
  totalPendingCents: number;
  remainingCents: number;
}

export interface Expense {
  id: string;
  collegeId: string;
  clubId: string;
  budgetId: string;
  eventId?: string;
  title: string;
  description?: string;
  category: ExpenseCategory;
  amountCents: number;
  currency: string;
  expenseDate: Date;
  receiptUrl?: string;
  status: ExpenseStatus;
  submittedBy?: string;
  submittedAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  paidAt?: Date;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseWithSubmitter extends Expense {
  submitter?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}
