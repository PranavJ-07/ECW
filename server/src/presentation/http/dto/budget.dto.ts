import { z } from 'zod';
import { BudgetStatus, ExpenseCategory, ExpenseStatus } from '../../../domain/enums/budget.enum';

const slugSchema = z
  .string()
  .min(3)
  .max(80)
  .regex(/^[a-z0-9-]+$/, 'Invalid slug format');

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');

export const clubSlugParamSchema = z.object({
  collegeSlug: slugSchema,
  clubSlug: slugSchema,
});

export const budgetIdParamSchema = z.object({
  collegeSlug: slugSchema,
  clubSlug: slugSchema,
  budgetId: objectIdSchema,
});

export const expenseIdParamSchema = z.object({
  collegeSlug: slugSchema,
  clubSlug: slugSchema,
  budgetId: objectIdSchema,
  expenseId: objectIdSchema,
});

export const createBudgetSchema = z.object({
  name: z.string().min(3).max(140),
  fiscalYear: z.coerce.number().int().min(2020).max(2100),
  term: z.string().max(50).optional(),
  allocatedAmountCents: z.coerce.number().int().positive(),
  currency: z.string().length(3).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateBudgetSchema = createBudgetSchema.partial();

export const createExpenseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  category: z.nativeEnum(ExpenseCategory),
  amountCents: z.coerce.number().int().positive(),
  currency: z.string().length(3).optional(),
  expenseDate: z.coerce.date(),
  receiptUrl: z.string().url().optional(),
  eventId: objectIdSchema.optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial().extend({
  eventId: objectIdSchema.nullable().optional(),
});

export const reviewExpenseSchema = z.object({
  reviewNotes: z.string().max(1000).optional(),
});

export const listBudgetsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.nativeEnum(BudgetStatus).optional(),
});

export const listExpensesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.nativeEnum(ExpenseStatus).optional(),
  category: z.nativeEnum(ExpenseCategory).optional(),
  eventId: objectIdSchema.optional(),
});

export type CreateBudgetDto = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetDto = z.infer<typeof updateBudgetSchema>;
export type CreateExpenseDto = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseDto = z.infer<typeof updateExpenseSchema>;
export type ReviewExpenseDto = z.infer<typeof reviewExpenseSchema>;
export type ListBudgetsQuery = z.infer<typeof listBudgetsQuerySchema>;
export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>;
