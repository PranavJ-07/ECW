import mongoose from 'mongoose';
import { BudgetNotFoundError } from '../../../domain/errors/budget.errors';
import { BudgetSummary, ClubBudget } from '../../../domain/entities/budget.entity';
import { BudgetStatus, ExpenseStatus } from '../../../domain/enums/budget.enum';
import {
  CreateBudgetData,
  ExpenseTotals,
  IBudgetRepository,
  ListBudgetsFilter,
  PaginatedBudgets,
  UpdateBudgetData,
} from '../../../domain/interfaces/budget.repository.interface';
import { ClubBudgetDocument, ClubBudgetModel } from '../models/club-budget.model';
import { ExpenseModel } from '../models/expense.model';

function toBudgetEntity(doc: ClubBudgetDocument): ClubBudget {
  return {
    id: doc._id.toString(),
    collegeId: doc.collegeId.toString(),
    clubId: doc.clubId.toString(),
    name: doc.name,
    fiscalYear: doc.fiscalYear,
    term: doc.term,
    allocatedAmountCents: doc.allocatedAmountCents,
    currency: doc.currency,
    status: doc.status as BudgetStatus,
    notes: doc.notes,
    createdBy: doc.createdBy.toString(),
    updatedBy: doc.updatedBy?.toString(),
    closedAt: doc.closedAt,
    closedBy: doc.closedBy?.toString(),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function buildSummary(budget: ClubBudget, totals: ExpenseTotals): BudgetSummary {
  return {
    ...budget,
    totalSpentCents: totals.spentCents,
    totalApprovedCents: totals.approvedCents,
    totalPendingCents: totals.pendingCents,
    remainingCents:
      budget.allocatedAmountCents - totals.spentCents - totals.approvedCents - totals.pendingCents,
  };
}

export class MongoBudgetRepository implements IBudgetRepository {
  async create(data: CreateBudgetData): Promise<ClubBudget> {
    const doc = await ClubBudgetModel.create(data);
    return toBudgetEntity(doc);
  }

  async findById(collegeId: string, id: string): Promise<ClubBudget | null> {
    const doc = await ClubBudgetModel.findOne({ _id: id, collegeId });
    return doc ? toBudgetEntity(doc) : null;
  }

  async findByIdWithSummary(collegeId: string, id: string): Promise<BudgetSummary | null> {
    const budget = await this.findById(collegeId, id);

    if (!budget) {
      return null;
    }

    const totals = await this.getExpenseTotals(budget.id);
    return buildSummary(budget, totals);
  }

  async update(collegeId: string, id: string, data: UpdateBudgetData): Promise<ClubBudget> {
    const doc = await ClubBudgetModel.findOneAndUpdate(
      { _id: id, collegeId },
      { $set: data },
      { new: true },
    );

    if (!doc) {
      throw new BudgetNotFoundError();
    }

    return toBudgetEntity(doc);
  }

  async close(collegeId: string, id: string, closedBy: string): Promise<ClubBudget> {
    const doc = await ClubBudgetModel.findOneAndUpdate(
      { _id: id, collegeId },
      {
        $set: {
          status: BudgetStatus.CLOSED,
          closedAt: new Date(),
          closedBy,
          updatedBy: closedBy,
        },
      },
      { new: true },
    );

    if (!doc) {
      throw new BudgetNotFoundError();
    }

    return toBudgetEntity(doc);
  }

  async list(filter: ListBudgetsFilter): Promise<PaginatedBudgets> {
    const query: Record<string, unknown> = {
      collegeId: filter.collegeId,
      clubId: filter.clubId,
    };

    if (filter.status) {
      query.status = filter.status;
    }

    const skip = (filter.page - 1) * filter.limit;

    const [docs, total] = await Promise.all([
      ClubBudgetModel.find(query).sort({ fiscalYear: -1, createdAt: -1 }).skip(skip).limit(filter.limit),
      ClubBudgetModel.countDocuments(query),
    ]);

    const budgets: BudgetSummary[] = await Promise.all(
      docs.map(async (doc) => {
        const budget = toBudgetEntity(doc);
        const totals = await this.getExpenseTotals(budget.id);
        return buildSummary(budget, totals);
      }),
    );

    return {
      budgets,
      total,
      page: filter.page,
      limit: filter.limit,
      totalPages: Math.ceil(total / filter.limit) || 1,
    };
  }

  async getExpenseTotals(budgetId: string): Promise<ExpenseTotals> {
    const budgetObjectId = new mongoose.Types.ObjectId(budgetId);

    const [spent, approved, pending] = await Promise.all([
      ExpenseModel.aggregate([
        { $match: { budgetId: budgetObjectId, status: ExpenseStatus.PAID } },
        { $group: { _id: null, total: { $sum: '$amountCents' } } },
      ]),
      ExpenseModel.aggregate([
        { $match: { budgetId: budgetObjectId, status: ExpenseStatus.APPROVED } },
        { $group: { _id: null, total: { $sum: '$amountCents' } } },
      ]),
      ExpenseModel.aggregate([
        { $match: { budgetId: budgetObjectId, status: ExpenseStatus.SUBMITTED } },
        { $group: { _id: null, total: { $sum: '$amountCents' } } },
      ]),
    ]);

    return {
      spentCents: spent[0]?.total ?? 0,
      approvedCents: approved[0]?.total ?? 0,
      pendingCents: pending[0]?.total ?? 0,
    };
  }
}

export const budgetRepository = new MongoBudgetRepository();
