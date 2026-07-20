import mongoose, { Schema, Document, Types } from 'mongoose';
import { MembershipRole, MembershipStatus } from '../../../domain/enums/club.enum';

export interface MembershipDocument extends Document {
  _id: Types.ObjectId;
  collegeId: Types.ObjectId;
  clubId: Types.ObjectId;
  userId: Types.ObjectId;
  role: MembershipRole;
  status: MembershipStatus;
  joinedAt?: Date;
  approvedAt?: Date;
  approvedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const membershipSchema = new Schema<MembershipDocument>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    clubId: { type: Schema.Types.ObjectId, ref: 'Club', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: {
      type: String,
      enum: Object.values(MembershipRole),
      default: MembershipRole.MEMBER,
    },
    status: {
      type: String,
      enum: Object.values(MembershipStatus),
      default: MembershipStatus.PENDING,
    },
    joinedAt: { type: Date },
    approvedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

membershipSchema.index({ clubId: 1, userId: 1 }, { unique: true });
membershipSchema.index({ userId: 1, status: 1 });

export const MembershipModel = mongoose.model<MembershipDocument>('Membership', membershipSchema);
