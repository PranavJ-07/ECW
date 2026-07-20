import mongoose, { Schema, Document, Types } from 'mongoose';
import { BudgetStatus } from '../../../domain/enums/budget.enum';

export interface ClubBudgetDocument extends Document {
  _id: Types.ObjectId;
  collegeId: Types.ObjectId;
  clubId: Types.ObjectId;
  name: string;
  fiscalYear: number;
  term?: string;
  allocatedAmountCents: number;
  currency: string;
  status: BudgetStatus;
  notes?: string;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  closedAt?: Date;
  closedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const clubBudgetSchema = new Schema<ClubBudgetDocument>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    clubId: { type: Schema.Types.ObjectId, ref: 'Club', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 140 },
    fiscalYear: { type: Number, required: true },
    term: { type: String, trim: true, maxlength: 50 },
    allocatedAmountCents: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'USD', uppercase: true },
    status: {
      type: String,
      enum: Object.values(BudgetStatus),
      default: BudgetStatus.ACTIVE,
    },
    notes: { type: String, maxlength: 2000 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    closedAt: { type: Date },
    closedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

clubBudgetSchema.index({ collegeId: 1, clubId: 1, fiscalYear: -1 });
clubBudgetSchema.index({ clubId: 1, status: 1 });

export const ClubBudgetModel = mongoose.model<ClubBudgetDocument>('ClubBudget', clubBudgetSchema);
