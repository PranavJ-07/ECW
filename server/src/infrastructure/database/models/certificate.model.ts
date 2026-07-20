import mongoose, { Schema, Document, Types } from 'mongoose';
import { CertificateStatus } from '../../../domain/enums/certificate.enum';

export interface CertificateDocument extends Document {
  _id: Types.ObjectId;
  collegeId: Types.ObjectId;
  eventId: Types.ObjectId;
  clubId: Types.ObjectId;
  userId: Types.ObjectId;
  registrationId: Types.ObjectId;
  certificateNumber: string;
  verificationCode: string;
  recipientName: string;
  eventTitle: string;
  eventDate: Date;
  clubName?: string;
  issuedAt: Date;
  issuedBy: Types.ObjectId;
  fileUrl?: string;
  status: CertificateStatus;
  revokedAt?: Date;
  revokedBy?: Types.ObjectId;
  revokeReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const certificateSchema = new Schema<CertificateDocument>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    clubId: { type: Schema.Types.ObjectId, ref: 'Club', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    registrationId: { type: Schema.Types.ObjectId, ref: 'Registration', required: true },
    certificateNumber: { type: String, required: true, unique: true },
    verificationCode: { type: String, required: true, unique: true },
    recipientName: { type: String, required: true },
    eventTitle: { type: String, required: true },
    eventDate: { type: Date, required: true },
    clubName: { type: String },
    issuedAt: { type: Date, required: true, default: Date.now },
    issuedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileUrl: { type: String },
    status: {
      type: String,
      enum: Object.values(CertificateStatus),
      default: CertificateStatus.ISSUED,
    },
    revokedAt: { type: Date },
    revokedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    revokeReason: { type: String },
  },
  { timestamps: true },
);

certificateSchema.index({ eventId: 1, userId: 1 }, { unique: true });
certificateSchema.index({ collegeId: 1, userId: 1, issuedAt: -1 });
certificateSchema.index({ eventId: 1, status: 1, issuedAt: -1 });

export const CertificateModel = mongoose.model<CertificateDocument>(
  'Certificate',
  certificateSchema,
);
