import mongoose, { Schema, Document, Types } from 'mongoose';
import { NotificationPriority, NotificationType } from '../../../domain/enums/notification.enum';

export interface NotificationDocument extends Document {
  _id: Types.ObjectId;
  collegeId: Types.ObjectId;
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  priority: NotificationPriority;
  data?: Record<string, string>;
  action?: { label: string; href: string };
  isRead: boolean;
  readAt?: Date;
  emailSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    priority: {
      type: String,
      enum: Object.values(NotificationPriority),
      default: NotificationPriority.NORMAL,
    },
    data: { type: Schema.Types.Mixed },
    action: {
      label: { type: String },
      href: { type: String },
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ collegeId: 1, userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

export const NotificationModel = mongoose.model<NotificationDocument>(
  'Notification',
  notificationSchema,
);
