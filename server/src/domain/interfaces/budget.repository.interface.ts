import {
  BudgetSummary,
  ClubBudget,
  Expense,
  ExpenseWithSubmitter,
} from '../entities/budget.entity';
import { BudgetStatus, ExpenseCategory, ExpenseStatus } from '../enums/budget.enum';

export interface CreateBudgetData {
  collegeId: string;
  clubId: string;
  name: string;
  fiscalYear: number;
  term?: string;
  allocatedAmountCents: number;
  currency: string;
  notes?: string;
  createdBy: string;
}

export interface UpdateBudgetData {
  name?: string;
  term?: string;
  allocatedAmountCents?: number;
  notes?: string;
  updatedBy: string;
}

export interface CreateExpenseData {
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
  createdBy: string;
}

export interface UpdateExpenseData {
  title?: string;
  description?: string;
  category?: ExpenseCategory;
  amountCents?: number;
  expenseDate?: Date;
  receiptUrl?: string;
  eventId?: string | null;
  updatedBy: string;
}

export interface ListBudgetsFilter {
  collegeId: string;
  clubId: string;
  status?: BudgetStatus;
  page: number;
  limit: number;
}

export interface ListExpensesFilter {
  collegeId: string;
  budgetId: string;
  status?: ExpenseStatus;
  category?: ExpenseCategory;
  eventId?: string;
  page: number;
  limit: number;
}

export interface PaginatedBudgets {
  budgets: BudgetSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedExpenses {
  expenses: ExpenseWithSubmitter[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ExpenseTotals {
  spentCents: number;
  approvedCents: number;
  pendingCents: number;
}

export interface IBudgetRepository {
  create(data: CreateBudgetData): Promise<ClubBudget>;
  findById(collegeId: string, id: string): Promise<ClubBudget | null>;
  findByIdWithSummary(collegeId: string, id: string): Promise<BudgetSummary | null>;
  update(collegeId: string, id: string, data: UpdateBudgetData): Promise<ClubBudget>;
  close(collegeId: string, id: string, closedBy: string): Promise<ClubBudget>;
  list(filter: ListBudgetsFilter): Promise<PaginatedBudgets>;
  getExpenseTotals(budgetId: string): Promise<ExpenseTotals>;
}

export interface IExpenseRepository {
  create(data: CreateExpenseData): Promise<Expense>;
  findById(collegeId: string, id: string): Promise<Expense | null>;
  update(collegeId: string, id: string, data: UpdateExpenseData): Promise<Expense>;
  delete(collegeId: string, id: string): Promise<void>;
  list(filter: ListExpensesFilter): Promise<PaginatedExpenses>;
  submit(collegeId: string, id: string, submittedBy: string): Promise<Expense>;
  approve(collegeId: string, id: string, reviewedBy: string, reviewNotes?: string): Promise<Expense>;
  reject(collegeId: string, id: string, reviewedBy: string, reviewNotes?: string): Promise<Expense>;
  markPaid(collegeId: string, id: string, updatedBy: string): Promise<Expense>;
}
