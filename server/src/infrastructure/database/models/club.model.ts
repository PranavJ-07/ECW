import mongoose, { Schema, Document, Types } from 'mongoose';
import { ClubCategory, ClubStatus, ClubVisibility } from '../../../domain/enums/club.enum';

export interface ClubDocument extends Document {
  _id: Types.ObjectId;
  collegeId: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  category: ClubCategory;
  tags: string[];
  logoUrl?: string;
  bannerUrl?: string;
  contactEmail?: string;
  socialLinks?: { instagram?: string; website?: string };
  facultyAdvisorId?: Types.ObjectId;
  status: ClubStatus;
  visibility: ClubVisibility;
  memberCount: number;
  officerCount: number;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const clubSchema = new Schema<ClubDocument>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 140 },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]{3,50}$/,
    },
    description: { type: String, trim: true, maxlength: 5000 },
    category: {
      type: String,
      enum: Object.values(ClubCategory),
      required: true,
    },
    tags: { type: [String], default: [], validate: [(v: string[]) => v.length <= 20, 'Max 20 tags'] },
    logoUrl: { type: String },
    bannerUrl: { type: String },
    contactEmail: { type: String, trim: true, lowercase: true },
    socialLinks: {
      instagram: { type: String },
      website: { type: String },
    },
    facultyAdvisorId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: Object.values(ClubStatus),
      default: ClubStatus.ACTIVE,
    },
    visibility: {
      type: String,
      enum: Object.values(ClubVisibility),
      default: ClubVisibility.COLLEGE_ONLY,
    },
    memberCount: { type: Number, default: 0, min: 0 },
    officerCount: { type: Number, default: 0, min: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

clubSchema.index({ collegeId: 1, slug: 1 }, { unique: true });
clubSchema.index({ collegeId: 1, status: 1, category: 1 });
clubSchema.index({ collegeId: 1, memberCount: -1 });
clubSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const ClubModel = mongoose.model<ClubDocument>('Club', clubSchema);
