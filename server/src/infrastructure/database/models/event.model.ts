import mongoose, { Schema, Document, Types } from 'mongoose';
import {
  EventLocationMode,
  EventStatus,
  EventVisibility,
} from '../../../domain/enums/event.enum';

export interface EventDocument extends Document {
  _id: Types.ObjectId;
  collegeId: Types.ObjectId;
  clubId: Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  coverImageUrl?: string;
  location: {
    mode: EventLocationMode;
    venueName?: string;
    address?: string;
    meetingUrl?: string;
  };
  startAt: Date;
  endAt: Date;
  timezone: string;
  capacity?: number;
  registrationCount: number;
  waitlistCount: number;
  registrationOpensAt?: Date;
  registrationClosesAt?: Date;
  requiresApproval: boolean;
  status: EventStatus;
  visibility: EventVisibility;
  tags: string[];
  createdBy: Types.ObjectId;
  publishedAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<EventDocument>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    clubId: { type: Schema.Types.ObjectId, ref: 'Club', required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]{3,80}$/,
    },
    description: { type: String, trim: true, maxlength: 10000 },
    coverImageUrl: { type: String },
    location: {
      mode: {
        type: String,
        enum: Object.values(EventLocationMode),
        required: true,
      },
      venueName: { type: String, trim: true },
      address: { type: String, trim: true },
      meetingUrl: { type: String, trim: true },
    },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true },
    timezone: { type: String, required: true, default: 'UTC' },
    capacity: { type: Number, min: 1 },
    registrationCount: { type: Number, default: 0, min: 0 },
    waitlistCount: { type: Number, default: 0, min: 0 },
    registrationOpensAt: { type: Date },
    registrationClosesAt: { type: Date },
    requiresApproval: { type: Boolean, default: false },
    status: {
      type: String,
      enum: Object.values(EventStatus),
      default: EventStatus.DRAFT,
    },
    visibility: {
      type: String,
      enum: Object.values(EventVisibility),
      default: EventVisibility.COLLEGE_ONLY,
    },
    tags: { type: [String], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    publishedAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String, maxlength: 500 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

eventSchema.index({ collegeId: 1, slug: 1 }, { unique: true });
eventSchema.index({ collegeId: 1, status: 1, startAt: 1 });
eventSchema.index({ clubId: 1, startAt: -1 });
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const EventModel = mongoose.model<EventDocument>('Event', eventSchema);
