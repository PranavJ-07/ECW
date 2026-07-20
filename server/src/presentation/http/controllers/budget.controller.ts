import { Request, Response, NextFunction } from 'express';
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
import {
  CreateBudgetDto,
  UpdateBudgetDto,
  CreateExpenseDto,
  UpdateExpenseDto,
  ReviewExpenseDto,
  ListBudgetsQuery,
  ListExpensesQuery,
} from '../dto/budget.dto';

export class BudgetController {
  constructor(
    private readonly createBudgetUseCase: CreateBudgetUseCase,
    private readonly listClubBudgetsUseCase: ListClubBudgetsUseCase,
    private readonly getBudgetUseCase: GetBudgetUseCase,
    private readonly updateBudgetUseCase: UpdateBudgetUseCase,
    private readonly closeBudgetUseCase: CloseBudgetUseCase,
    private readonly createExpenseUseCase: CreateExpenseUseCase,
    private readonly listExpensesUseCase: ListExpensesUseCase,
    private readonly updateExpenseUseCase: UpdateExpenseUseCase,
    private readonly deleteExpenseUseCase: DeleteExpenseUseCase,
    private readonly submitExpenseUseCase: SubmitExpenseUseCase,
    private readonly approveExpenseUseCase: ApproveExpenseUseCase,
    private readonly rejectExpenseUseCase: RejectExpenseUseCase,
    private readonly markExpensePaidUseCase: MarkExpensePaidUseCase,
  ) {}

  createBudget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as CreateBudgetDto;
      const budget = await this.createBudgetUseCase.execute({
        collegeId: req.tenant!.collegeId,
        clubSlug: String(req.params.clubSlug),
        ...body,
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });
      res.status(201).json({ success: true, data: budget });
    } catch (error) {
      next(error);
    }
  };

  listBudgets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as ListBudgetsQuery;
      const result = await this.listClubBudgetsUseCase.execute({
        collegeId: req.tenant!.collegeId,
        clubSlug: String(req.params.clubSlug),
        status: query.status,
        page: query.page,
        limit: query.limit,
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });
      res.status(200).json({
        success: true,
        data: result.budgets,
        meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
      });
    } catch (error) {
      next(error);
    }
  };

  getBudget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const budget = await this.getBudgetUseCase.execute({
        collegeId: req.tenant!.collegeId,
        clubSlug: String(req.params.clubSlug),
        budgetId: String(req.params.budgetId),
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });
      res.status(200).json({ success: true, data: budget });
    } catch (error) {
      next(error);
    }
  };

  updateBudget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as UpdateBudgetDto;
      const budget = await this.updateBudgetUseCase.execute({
        collegeId: req.tenant!.collegeId,
        clubSlug: String(req.params.clubSlug),
        budgetId: String(req.params.budgetId),
        ...body,
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });
      res.status(200).json({ success: true, data: budget });
    } catch (error) {
      next(error);
    }
  };

  closeBudget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const budget = await this.closeBudgetUseCase.execute({
        collegeId: req.tenant!.collegeId,
        clubSlug: String(req.params.clubSlug),
        budgetId: String(req.params.budgetId),
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });
      res.status(200).json({ success: true, data: budget });
    } catch (error) {
      next(error);
    }
  };

  createExpense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as CreateExpenseDto;
      const expense = await this.createExpenseUseCase.execute({
        collegeId: req.tenant!.collegeId,
        clubSlug: String(req.params.clubSlug),
        budgetId: String(req.params.budgetId),
        ...body,
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });
      res.status(201).json({ success: true, data: expense });
    } catch (error) {
      next(error);
    }
  };

  listExpenses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as ListExpensesQuery;
      const result = await this.listExpensesUseCase.execute({
        collegeId: req.tenant!.collegeId,
        clubSlug: String(req.params.clubSlug),
        budgetId: String(req.params.budgetId),
        status: query.status,
        category: query.category,
        eventId: query.eventId,
        page: query.page,
        limit: query.limit,
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });
      res.status(200).json({
        success: true,
        data: result.expenses,
        meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
      });
    } catch (error) {
      next(error);
    }
  };

  updateExpense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as UpdateExpenseDto;
      const expense = await this.updateExpenseUseCase.execute({
        collegeId: req.tenant!.collegeId,
        clubSlug: String(req.params.clubSlug),
        budgetId: String(req.params.budgetId),
        expenseId: String(req.params.expenseId),
        ...body,
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });
      res.status(200).json({ success: true, data: expense });
    } catch (error) {
      next(error);
    }
  };

  deleteExpense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteExpenseUseCase.execute({
        collegeId: req.tenant!.collegeId,
        clubSlug: String(req.params.clubSlug),
        budgetId: String(req.params.budgetId),
        expenseId: String(req.params.expenseId),
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });
      res.status(200).json({ success: true, data: { message: 'Expense deleted' } });
    } catch (error) {
      next(error);
    }
  };

  submitExpense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const expense = await this.submitExpenseUseCase.execute({
        collegeId: req.tenant!.collegeId,
        clubSlug: String(req.params.clubSlug),
        budgetId: String(req.params.budgetId),
        expenseId: String(req.params.expenseId),
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });
      res.status(200).json({ success: true, data: expense });
    } catch (error) {
      next(error);
    }
  };

  approveExpense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as ReviewExpenseDto;
      const expense = await this.approveExpenseUseCase.execute({
        collegeId: req.tenant!.collegeId,
        clubSlug: String(req.params.clubSlug),
        budgetId: String(req.params.budgetId),
        expenseId: String(req.params.expenseId),
        reviewNotes: body.reviewNotes,
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });
      res.status(200).json({ success: true, data: expense });
    } catch (error) {
      next(error);
    }
  };

  rejectExpense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as ReviewExpenseDto;
      const expense = await this.rejectExpenseUseCase.execute({
        collegeId: req.tenant!.collegeId,
        clubSlug: String(req.params.clubSlug),
        budgetId: String(req.params.budgetId),
        expenseId: String(req.params.expenseId),
        reviewNotes: body.reviewNotes,
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });
      res.status(200).json({ success: true, data: expense });
    } catch (error) {
      next(error);
    }
  };

  markExpensePaid = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const expense = await this.markExpensePaidUseCase.execute({
        collegeId: req.tenant!.collegeId,
        clubSlug: String(req.params.clubSlug),
        budgetId: String(req.params.budgetId),
        expenseId: String(req.params.expenseId),
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });
      res.status(200).json({ success: true, data: expense });
    } catch (error) {
      next(error);
    }
  };
}
