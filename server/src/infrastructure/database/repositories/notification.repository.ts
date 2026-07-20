import { NotificationNotFoundError } from '../../../domain/errors/notification.errors';
import { Notification } from '../../../domain/entities/notification.entity';
import { NotificationPriority, NotificationType } from '../../../domain/enums/notification.enum';
import {
  CreateNotificationData,
  INotificationRepository,
  ListNotificationsFilter,
  PaginatedNotifications,
} from '../../../domain/interfaces/notification.repository.interface';
import { NotificationDocument, NotificationModel } from '../models/notification.model';

function toEntity(doc: NotificationDocument): Notification {
  return {
    id: doc._id.toString(),
    collegeId: doc.collegeId.toString(),
    userId: doc.userId.toString(),
    type: doc.type as NotificationType,
    title: doc.title,
    body: doc.body,
    priority: doc.priority as NotificationPriority,
    data: doc.data,
    action: doc.action,
    isRead: doc.isRead,
    readAt: doc.readAt,
    emailSent: doc.emailSent,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoNotificationRepository implements INotificationRepository {
  async create(data: CreateNotificationData): Promise<Notification> {
    const doc = await NotificationModel.create(data);
    return toEntity(doc);
  }

  async createMany(data: CreateNotificationData[]): Promise<Notification[]> {
    const notifications: Notification[] = [];

    for (const item of data) {
      notifications.push(await this.create(item));
    }

    return notifications;
  }

  async findById(collegeId: string, id: string): Promise<Notification | null> {
    const doc = await NotificationModel.findOne({ _id: id, collegeId });
    return doc ? toEntity(doc) : null;
  }

  async list(filter: ListNotificationsFilter): Promise<PaginatedNotifications> {
    const query: Record<string, unknown> = {
      collegeId: filter.collegeId,
      userId: filter.userId,
    };

    if (filter.isRead !== undefined) {
      query.isRead = filter.isRead;
    }

    if (filter.type) {
      query.type = filter.type;
    }

    const skip = (filter.page - 1) * filter.limit;

    const [docs, total, unreadCount] = await Promise.all([
      NotificationModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(filter.limit),
      NotificationModel.countDocuments(query),
      NotificationModel.countDocuments({
        collegeId: filter.collegeId,
        userId: filter.userId,
        isRead: false,
      }),
    ]);

    return {
      notifications: docs.map(toEntity),
      total,
      page: filter.page,
      limit: filter.limit,
      totalPages: Math.ceil(total / filter.limit) || 1,
      unreadCount,
    };
  }

  async getUnreadCount(collegeId: string, userId: string) {
    const total = await NotificationModel.countDocuments({
      collegeId,
      userId,
      isRead: false,
    });

    return { total };
  }

  async markRead(collegeId: string, userId: string, id: string): Promise<Notification> {
    const doc = await NotificationModel.findOneAndUpdate(
      { _id: id, collegeId, userId },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true },
    );

    if (!doc) {
      throw new NotificationNotFoundError();
    }

    return toEntity(doc);
  }

  async markAllRead(collegeId: string, userId: string): Promise<number> {
    const result = await NotificationModel.updateMany(
      { collegeId, userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
    );

    return result.modifiedCount;
  }

  async delete(collegeId: string, userId: string, id: string): Promise<void> {
    const result = await NotificationModel.deleteOne({ _id: id, collegeId, userId });

    if (result.deletedCount === 0) {
      throw new NotificationNotFoundError();
    }
  }
}

export const notificationRepository = new MongoNotificationRepository();
