import { apiClient } from '@/api/axios';
import type { ApiSuccessResponse } from '@/types/api.types';
import type { BudgetSummary, Expense } from '@/types/budget.types';
import type { PaginationMeta } from '@/types/pagination.types';
import { extractPaginated } from '@/types/pagination.types';

function clubBudgetPath(collegeSlug: string, clubSlug: string): string {
  return `/colleges/${collegeSlug}/clubs/${clubSlug}/budgets`;
}

export async function listClubBudgets(collegeSlug: string, clubSlug: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<BudgetSummary[]>>(
    clubBudgetPath(collegeSlug, clubSlug),
  );
  return extractPaginated(data.data, data.meta as PaginationMeta | undefined);
}

export async function listBudgetExpenses(
  collegeSlug: string,
  clubSlug: string,
  budgetId: string,
) {
  const { data } = await apiClient.get<ApiSuccessResponse<Expense[]>>(
    `${clubBudgetPath(collegeSlug, clubSlug)}/${budgetId}/expenses`,
  );
  return extractPaginated(data.data, data.meta as PaginationMeta | undefined);
}
