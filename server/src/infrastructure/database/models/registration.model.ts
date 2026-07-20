import mongoose, { Schema, Document, Types } from 'mongoose';
import {
  RegistrationApprovalStatus,
  RegistrationSource,
  RegistrationStatus,
} from '../../../domain/enums/registration.enum';

export interface RegistrationDocument extends Document {
  _id: Types.ObjectId;
  collegeId: Types.ObjectId;
  eventId: Types.ObjectId;
  clubId: Types.ObjectId;
  userId: Types.ObjectId;
  status: RegistrationStatus;
  approvalStatus: RegistrationApprovalStatus;
  registeredAt: Date;
  cancelledAt?: Date;
  checkedInAt?: Date;
  checkedInBy?: Types.ObjectId;
  source: RegistrationSource;
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema<RegistrationDocument>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    clubId: { type: Schema.Types.ObjectId, ref: 'Club', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: Object.values(RegistrationStatus),
      required: true,
    },
    approvalStatus: {
      type: String,
      enum: Object.values(RegistrationApprovalStatus),
      default: RegistrationApprovalStatus.NOT_REQUIRED,
    },
    registeredAt: { type: Date, required: true, default: Date.now },
    cancelledAt: { type: Date },
    checkedInAt: { type: Date },
    checkedInBy: { type: Schema.Types.ObjectId, ref: 'User' },
    source: {
      type: String,
      enum: Object.values(RegistrationSource),
      default: RegistrationSource.SELF,
    },
    idempotencyKey: { type: String, sparse: true },
  },
  { timestamps: true },
);

registrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });
registrationSchema.index({ userId: 1, status: 1, registeredAt: -1 });
registrationSchema.index({ eventId: 1, status: 1 });
registrationSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

export const RegistrationModel = mongoose.model<RegistrationDocument>(
  'Registration',
  registrationSchema,
);
