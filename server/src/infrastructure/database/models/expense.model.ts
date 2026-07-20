import mongoose, { Schema, Document, Types } from 'mongoose';
import { ExpenseCategory, ExpenseStatus } from '../../../domain/enums/budget.enum';

export interface ExpenseDocument extends Document {
  _id: Types.ObjectId;
  collegeId: Types.ObjectId;
  clubId: Types.ObjectId;
  budgetId: Types.ObjectId;
  eventId?: Types.ObjectId;
  title: string;
  description?: string;
  category: ExpenseCategory;
  amountCents: number;
  currency: string;
  expenseDate: Date;
  receiptUrl?: string;
  status: ExpenseStatus;
  submittedBy?: Types.ObjectId;
  submittedAt?: Date;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  paidAt?: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<ExpenseDocument>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    clubId: { type: Schema.Types.ObjectId, ref: 'Club', required: true, index: true },
    budgetId: { type: Schema.Types.ObjectId, ref: 'ClubBudget', required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 2000 },
    category: {
      type: String,
      enum: Object.values(ExpenseCategory),
      required: true,
    },
    amountCents: { type: Number, required: true, min: 1 },
    currency: { type: String, required: true, default: 'USD', uppercase: true },
    expenseDate: { type: Date, required: true },
    receiptUrl: { type: String },
    status: {
      type: String,
      enum: Object.values(ExpenseStatus),
      default: ExpenseStatus.DRAFT,
    },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    submittedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    reviewNotes: { type: String, maxlength: 1000 },
    paidAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

expenseSchema.index({ budgetId: 1, status: 1, expenseDate: -1 });
expenseSchema.index({ eventId: 1 });
expenseSchema.index({ clubId: 1, expenseDate: -1 });

export const ExpenseModel = mongoose.model<ExpenseDocument>('Expense', expenseSchema);
