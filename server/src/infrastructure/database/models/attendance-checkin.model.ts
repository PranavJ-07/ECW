import mongoose, { Schema, Document, Types } from 'mongoose';
import { AttendanceCheckInMethod } from '../../../domain/enums/attendance.enum';

export interface AttendanceCheckInDocument extends Document {
  _id: Types.ObjectId;
  collegeId: Types.ObjectId;
  eventId: Types.ObjectId;
  clubId: Types.ObjectId;
  registrationId: Types.ObjectId;
  userId: Types.ObjectId;
  method: AttendanceCheckInMethod;
  qrTokenId?: string;
  checkedInAt: Date;
  checkedInBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceCheckInSchema = new Schema<AttendanceCheckInDocument>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    clubId: { type: Schema.Types.ObjectId, ref: 'Club', required: true, index: true },
    registrationId: { type: Schema.Types.ObjectId, ref: 'Registration', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    method: {
      type: String,
      enum: Object.values(AttendanceCheckInMethod),
      required: true,
    },
    qrTokenId: { type: String, sparse: true },
    checkedInAt: { type: Date, required: true, default: Date.now },
    checkedInBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

attendanceCheckInSchema.index({ eventId: 1, checkedInAt: -1 });
attendanceCheckInSchema.index({ registrationId: 1 }, { unique: true });
attendanceCheckInSchema.index({ qrTokenId: 1 }, { unique: true, sparse: true });

export const AttendanceCheckInModel = mongoose.model<AttendanceCheckInDocument>(
  'AttendanceCheckIn',
  attendanceCheckInSchema,
);
