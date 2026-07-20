import mongoose, { Schema, Document, Types } from 'mongoose';

export interface CollegeDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  allowedEmailDomains: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const collegeSchema = new Schema<CollegeDocument>(
  {
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]{3,50}$/,
    },
    allowedEmailDomains: {
      type: [String],
      required: true,
      validate: {
        validator: (domains: string[]) => domains.length > 0,
        message: 'At least one email domain is required',
      },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

collegeSchema.index({ allowedEmailDomains: 1 });

export const CollegeModel = mongoose.model<CollegeDocument>('College', collegeSchema);
