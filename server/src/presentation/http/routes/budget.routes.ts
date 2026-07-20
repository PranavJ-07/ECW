import { Router } from 'express';
import { budgetController } from './budget.container';
import { authenticate } from '../middleware/authenticate.middleware';
import { requirePermissions } from '../middleware/authorize.middleware';
import { resolveTenant } from '../middleware/tenant.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  clubSlugParamSchema,
  budgetIdParamSchema,
  expenseIdParamSchema,
  createBudgetSchema,
  updateBudgetSchema,
  createExpenseSchema,
  updateExpenseSchema,
  reviewExpenseSchema,
  listBudgetsQuerySchema,
  listExpensesQuerySchema,
} from '../dto/budget.dto';

const router = Router({ mergeParams: true });

/**
 * Club-scoped budget routes:
 * /colleges/:collegeSlug/clubs/:clubSlug/budgets/...
 */
router.use(authenticate, resolveTenant);

router.get(
  '/',
  validate({ params: clubSlugParamSchema, query: listBudgetsQuerySchema }),
  requirePermissions('budgets:read'),
  budgetController.listBudgets,
);

router.post(
  '/',
  validate({ params: clubSlugParamSchema, body: createBudgetSchema }),
  budgetController.createBudget,
);

router.get(
  '/:budgetId',
  validate({ params: budgetIdParamSchema }),
  requirePermissions('budgets:read'),
  budgetController.getBudget,
);

router.patch(
  '/:budgetId',
  validate({ params: budgetIdParamSchema, body: updateBudgetSchema }),
  budgetController.updateBudget,
);

router.post(
  '/:budgetId/close',
  validate({ params: budgetIdParamSchema }),
  budgetController.closeBudget,
);

router.get(
  '/:budgetId/expenses',
  validate({ params: budgetIdParamSchema, query: listExpensesQuerySchema }),
  requirePermissions('budgets:read'),
  budgetController.listExpenses,
);

router.post(
  '/:budgetId/expenses',
  validate({ params: budgetIdParamSchema, body: createExpenseSchema }),
  requirePermissions('expenses:create'),
  budgetController.createExpense,
);

router.patch(
  '/:budgetId/expenses/:expenseId',
  validate({ params: expenseIdParamSchema, body: updateExpenseSchema }),
  budgetController.updateExpense,
);

router.delete(
  '/:budgetId/expenses/:expenseId',
  validate({ params: expenseIdParamSchema }),
  budgetController.deleteExpense,
);

router.post(
  '/:budgetId/expenses/:expenseId/submit',
  validate({ params: expenseIdParamSchema }),
  budgetController.submitExpense,
);

router.post(
  '/:budgetId/expenses/:expenseId/approve',
  validate({ params: expenseIdParamSchema, body: reviewExpenseSchema }),
  budgetController.approveExpense,
);

router.post(
  '/:budgetId/expenses/:expenseId/reject',
  validate({ params: expenseIdParamSchema, body: reviewExpenseSchema }),
  budgetController.rejectExpense,
);

router.post(
  '/:budgetId/expenses/:expenseId/mark-paid',
  validate({ params: expenseIdParamSchema }),
  budgetController.markExpensePaid,
);

export default router;
