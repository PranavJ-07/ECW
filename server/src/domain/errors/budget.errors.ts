import { AppError, ForbiddenError } from './AppError';
import { ConflictError } from './auth.errors';

export class BudgetNotFoundError extends AppError {
  constructor(message = 'Budget not found') {
    super(message, 404, 'BUDGET_NOT_FOUND');
  }
}

export class ExpenseNotFoundError extends AppError {
  constructor(message = 'Expense not found') {
    super(message, 404, 'EXPENSE_NOT_FOUND');
  }
}

export class BudgetClosedError extends AppError {
  constructor(message = 'Budget is closed and cannot be modified') {
    super(message, 403, 'BUDGET_CLOSED');
  }
}

export class BudgetOverAllocationError extends ConflictError {
  constructor(message = 'Expense would exceed budget allocation') {
    super(message, 'BUDGET_OVER_ALLOCATION');
  }
}

export class ExpenseInvalidStatusError extends AppError {
  constructor(message = 'Expense status does not allow this action') {
    super(message, 409, 'EXPENSE_INVALID_STATUS');
  }
}

export class BudgetAccessDeniedError extends ForbiddenError {
  constructor(message = 'You do not have permission to manage this budget') {
    super(message, 'BUDGET_ACCESS_DENIED');
  }
}
