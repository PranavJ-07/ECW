import { CreateBudgetUseCase } from '../../../application/budgets/use-cases/create-budget.usecase';
import { ListClubBudgetsUseCase } from '../../../application/budgets/use-cases/list-club-budgets.usecase';
import { GetBudgetUseCase } from '../../../application/budgets/use-cases/get-budget.usecase';
import { UpdateBudgetUseCase } from '../../../application/budgets/use-cases/update-budget.usecase';
import { CloseBudgetUseCase } from '../../../application/budgets/use-cases/close-budget.usecase';
import { CreateExpenseUseCase } from '../../../application/budgets/use-cases/create-expense.usecase';
import { ListExpensesUseCase } from '../../../application/budgets/use-cases/list-expenses.usecase';
import { UpdateExpenseUseCase, DeleteExpenseUseCase } from '../../../application/budgets/use-cases/update-expense.usecase';
import {
  SubmitExpenseUseCase,
  ApproveExpenseUseCase,
  RejectExpenseUseCase,
  MarkExpensePaidUseCase,
} from '../../../application/budgets/use-cases/expense-workflow.usecase';
import { BudgetAuthorizationService } from '../../../application/budgets/services/budget-authorization.service';
import { BudgetCalculationService } from '../../../application/budgets/services/budget-calculation.service';
import { budgetRepository } from '../../../infrastructure/database/repositories/budget.repository';
import { expenseRepository } from '../../../infrastructure/database/repositories/expense.repository';
import { clubRepository } from '../../../infrastructure/database/repositories/club.repository';
import { membershipRepository } from '../../../infrastructure/database/repositories/membership.repository';
import { BudgetController } from '../controllers/budget.controller';

const budgetAuthService = new BudgetAuthorizationService(membershipRepository);
const budgetCalculationService = new BudgetCalculationService();

const createBudgetUseCase = new CreateBudgetUseCase(
  budgetRepository,
  clubRepository,
  budgetAuthService,
  budgetCalculationService,
);
const listClubBudgetsUseCase = new ListClubBudgetsUseCase(
  budgetRepository,
  clubRepository,
  budgetAuthService,
);
const getBudgetUseCase = new GetBudgetUseCase(budgetRepository, clubRepository, budgetAuthService);
const updateBudgetUseCase = new UpdateBudgetUseCase(
  budgetRepository,
  clubRepository,
  budgetAuthService,
  budgetCalculationService,
);
const closeBudgetUseCase = new CloseBudgetUseCase(budgetRepository, clubRepository, budgetAuthService);
const createExpenseUseCase = new CreateExpenseUseCase(
  expenseRepository,
  budgetRepository,
  clubRepository,
  budgetAuthService,
);
const listExpensesUseCase = new ListExpensesUseCase(
  expenseRepository,
  budgetRepository,
  clubRepository,
  budgetAuthService,
);
const updateExpenseUseCase = new UpdateExpenseUseCase(
  expenseRepository,
  budgetRepository,
  clubRepository,
  budgetAuthService,
  budgetCalculationService,
);
const deleteExpenseUseCase = new DeleteExpenseUseCase(
  expenseRepository,
  budgetRepository,
  clubRepository,
  budgetAuthService,
);
const submitExpenseUseCase = new SubmitExpenseUseCase(
  expenseRepository,
  budgetRepository,
  clubRepository,
  budgetAuthService,
  budgetCalculationService,
);
const approveExpenseUseCase = new ApproveExpenseUseCase(
  expenseRepository,
  budgetRepository,
  clubRepository,
  budgetAuthService,
);
const rejectExpenseUseCase = new RejectExpenseUseCase(
  expenseRepository,
  budgetRepository,
  clubRepository,
  budgetAuthService,
);
const markExpensePaidUseCase = new MarkExpensePaidUseCase(
  expenseRepository,
  budgetRepository,
  clubRepository,
  budgetAuthService,
);

export const budgetController = new BudgetController(
  createBudgetUseCase,
  listClubBudgetsUseCase,
  getBudgetUseCase,
  updateBudgetUseCase,
  closeBudgetUseCase,
  createExpenseUseCase,
  listExpensesUseCase,
  updateExpenseUseCase,
  deleteExpenseUseCase,
  submitExpenseUseCase,
  approveExpenseUseCase,
  rejectExpenseUseCase,
  markExpensePaidUseCase,
);
