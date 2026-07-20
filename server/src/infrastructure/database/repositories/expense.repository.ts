import { ExpenseNotFoundError } from '../../../domain/errors/budget.errors';
import { Expense, ExpenseWithSubmitter } from '../../../domain/entities/budget.entity';
import { ExpenseCategory, ExpenseStatus } from '../../../domain/enums/budget.enum';
import {
  CreateExpenseData,
  IExpenseRepository,
  ListExpensesFilter,
  PaginatedExpenses,
  UpdateExpenseData,
} from '../../../domain/interfaces/budget.repository.interface';
import { ExpenseDocument, ExpenseModel } from '../models/expense.model';

function toExpenseEntity(doc: ExpenseDocument): Expense {
  return {
    id: doc._id.toString(),
    collegeId: doc.collegeId.toString(),
    clubId: doc.clubId.toString(),
    budgetId: doc.budgetId.toString(),
    eventId: doc.eventId?.toString(),
    title: doc.title,
    description: doc.description,
    category: doc.category as ExpenseCategory,
    amountCents: doc.amountCents,
    currency: doc.currency,
    expenseDate: doc.expenseDate,
    receiptUrl: doc.receiptUrl,
    status: doc.status as ExpenseStatus,
    submittedBy: doc.submittedBy?.toString(),
    submittedAt: doc.submittedAt,
    reviewedBy: doc.reviewedBy?.toString(),
    reviewedAt: doc.reviewedAt,
    reviewNotes: doc.reviewNotes,
    paidAt: doc.paidAt,
    createdBy: doc.createdBy.toString(),
    updatedBy: doc.updatedBy?.toString(),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoExpenseRepository implements IExpenseRepository {
  async create(data: CreateExpenseData): Promise<Expense> {
    const doc = await ExpenseModel.create(data);
    return toExpenseEntity(doc);
  }

  async findById(collegeId: string, id: string): Promise<Expense | null> {
    const doc = await ExpenseModel.findOne({ _id: id, collegeId });
    return doc ? toExpenseEntity(doc) : null;
  }

  async update(collegeId: string, id: string, data: UpdateExpenseData): Promise<Expense> {
    const { eventId, ...rest } = data;
    const set: Record<string, unknown> = { ...rest };
    const updateQuery: Record<string, unknown> = { $set: set };

    if (eventId === null) {
      updateQuery.$unset = { eventId: 1 };
    } else if (eventId !== undefined) {
      set.eventId = eventId;
    }

    const doc = await ExpenseModel.findOneAndUpdate(
      { _id: id, collegeId, status: ExpenseStatus.DRAFT },
      updateQuery,
      { new: true },
    );

    if (!doc) {
      throw new ExpenseNotFoundError('Expense not found or not in draft status');
    }

    return toExpenseEntity(doc);
  }

  async delete(collegeId: string, id: string): Promise<void> {
    const result = await ExpenseModel.deleteOne({
      _id: id,
      collegeId,
      status: ExpenseStatus.DRAFT,
    });

    if (result.deletedCount === 0) {
      throw new ExpenseNotFoundError('Expense not found or not in draft status');
    }
  }

  async list(filter: ListExpensesFilter): Promise<PaginatedExpenses> {
    const query: Record<string, unknown> = {
      collegeId: filter.collegeId,
      budgetId: filter.budgetId,
    };

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.category) {
      query.category = filter.category;
    }

    if (filter.eventId) {
      query.eventId = filter.eventId;
    }

    const skip = (filter.page - 1) * filter.limit;

    const [docs, total] = await Promise.all([
      ExpenseModel.find(query)
        .sort({ expenseDate: -1 })
        .skip(skip)
        .limit(filter.limit)
        .populate('createdBy', 'firstName lastName email'),
      ExpenseModel.countDocuments(query),
    ]);

    const expenses: ExpenseWithSubmitter[] = docs.map((doc) => {
      const base = toExpenseEntity(doc);
      const submitter =
        doc.createdBy && typeof doc.createdBy === 'object'
          ? (doc.createdBy as unknown as {
              _id: { toString(): string };
              firstName: string;
              lastName: string;
              email: string;
            })
          : null;

      return {
        ...base,
        submitter: submitter
          ? {
              id: submitter._id.toString(),
              firstName: submitter.firstName,
              lastName: submitter.lastName,
              email: submitter.email,
            }
          : undefined,
      };
    });

    return {
      expenses,
      total,
      page: filter.page,
      limit: filter.limit,
      totalPages: Math.ceil(total / filter.limit) || 1,
    };
  }

  async submit(collegeId: string, id: string, submittedBy: string): Promise<Expense> {
    const doc = await ExpenseModel.findOneAndUpdate(
      { _id: id, collegeId, status: ExpenseStatus.DRAFT },
      {
        $set: {
          status: ExpenseStatus.SUBMITTED,
          submittedBy,
          submittedAt: new Date(),
          updatedBy: submittedBy,
        },
      },
      { new: true },
    );

    if (!doc) {
      throw new ExpenseNotFoundError('Expense not found or not in draft status');
    }

    return toExpenseEntity(doc);
  }

  async approve(
    collegeId: string,
    id: string,
    reviewedBy: string,
    reviewNotes?: string,
  ): Promise<Expense> {
    const doc = await ExpenseModel.findOneAndUpdate(
      { _id: id, collegeId, status: ExpenseStatus.SUBMITTED },
      {
        $set: {
          status: ExpenseStatus.APPROVED,
          reviewedBy,
          reviewedAt: new Date(),
          reviewNotes,
          updatedBy: reviewedBy,
        },
      },
      { new: true },
    );

    if (!doc) {
      throw new ExpenseNotFoundError('Expense not found or not in submitted status');
    }

    return toExpenseEntity(doc);
  }

  async reject(
    collegeId: string,
    id: string,
    reviewedBy: string,
    reviewNotes?: string,
  ): Promise<Expense> {
    const doc = await ExpenseModel.findOneAndUpdate(
      { _id: id, collegeId, status: ExpenseStatus.SUBMITTED },
      {
        $set: {
          status: ExpenseStatus.REJECTED,
          reviewedBy,
          reviewedAt: new Date(),
          reviewNotes,
          updatedBy: reviewedBy,
        },
      },
      { new: true },
    );

    if (!doc) {
      throw new ExpenseNotFoundError('Expense not found or not in submitted status');
    }

    return toExpenseEntity(doc);
  }

  async markPaid(collegeId: string, id: string, updatedBy: string): Promise<Expense> {
    const doc = await ExpenseModel.findOneAndUpdate(
      { _id: id, collegeId, status: ExpenseStatus.APPROVED },
      {
        $set: {
          status: ExpenseStatus.PAID,
          paidAt: new Date(),
          updatedBy,
        },
      },
      { new: true },
    );

    if (!doc) {
      throw new ExpenseNotFoundError('Expense not found or not in approved status');
    }

    return toExpenseEntity(doc);
  }
}

export const expenseRepository = new MongoExpenseRepository();
