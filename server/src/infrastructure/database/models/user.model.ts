import mongoose, { Schema, Document, Types } from 'mongoose';
import { PlatformRole, UserRole } from '../../../domain/enums/user-role.enum';

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  collegeId: Types.ObjectId;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  platformRole: PlatformRole | null;
  emailVerified: boolean;
  emailVerifiedAt: Date | null;
  isActive: boolean;
  department?: string;
  academicYear?: number;
  studentId?: string;
  failedLoginAttempts: number;
  lockUntil: Date | null;
  lastLoginAt: Date | null;
  passwordChangedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    firstName: { type: String, required: true, trim: true, minlength: 1, maxlength: 80 },
    lastName: { type: String, required: true, trim: true, minlength: 1, maxlength: 80 },
    roles: {
      type: [String],
      enum: Object.values(UserRole),
      default: [UserRole.STUDENT],
    },
    platformRole: {
      type: String,
      enum: Object.values(PlatformRole),
      default: null,
    },
    emailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    department: { type: String, trim: true, maxlength: 120 },
    academicYear: { type: Number, min: 1, max: 8 },
    studentId: { type: String, trim: true },
    failedLoginAttempts: { type: Number, default: 0, min: 0 },
    lockUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

userSchema.index({ collegeId: 1, email: 1 }, { unique: true });
userSchema.index({ collegeId: 1, studentId: 1 }, { unique: true, sparse: true });

export const UserModel = mongoose.model<UserDocument>('User', userSchema);
