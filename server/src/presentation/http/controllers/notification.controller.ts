import { Request, Response, NextFunction } from 'express';
import { ListMyNotificationsUseCase } from '../../../application/notifications/use-cases/list-my-notifications.usecase';
import { GetUnreadCountUseCase } from '../../../application/notifications/use-cases/get-unread-count.usecase';
import {
  MarkNotificationReadUseCase,
  MarkAllNotificationsReadUseCase,
  DeleteNotificationUseCase,
} from '../../../application/notifications/use-cases/manage-notifications.usecase';
import { ListNotificationsQuery } from '../dto/notification.dto';

export class NotificationController {
  constructor(
    private readonly listMyNotificationsUseCase: ListMyNotificationsUseCase,
    private readonly getUnreadCountUseCase: GetUnreadCountUseCase,
    private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
    private readonly markAllNotificationsReadUseCase: MarkAllNotificationsReadUseCase,
    private readonly deleteNotificationUseCase: DeleteNotificationUseCase,
  ) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as ListNotificationsQuery;
      const result = await this.listMyNotificationsUseCase.execute({
        collegeId: req.tenant!.collegeId,
        userId: req.authUser!.userId,
        isRead: query.isRead,
        type: query.type,
        page: query.page,
        limit: query.limit,
      });

      res.status(200).json({
        success: true,
        data: result.notifications,
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          unreadCount: result.unreadCount,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  unreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getUnreadCountUseCase.execute({
        collegeId: req.tenant!.collegeId,
        userId: req.authUser!.userId,
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  markRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const notification = await this.markNotificationReadUseCase.execute({
        collegeId: req.tenant!.collegeId,
        userId: req.authUser!.userId,
        notificationId: String(req.params.notificationId),
      });

      res.status(200).json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  };

  markAllRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.markAllNotificationsReadUseCase.execute({
        collegeId: req.tenant!.collegeId,
        userId: req.authUser!.userId,
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteNotificationUseCase.execute({
        collegeId: req.tenant!.collegeId,
        userId: req.authUser!.userId,
        notificationId: String(req.params.notificationId),
      });

      res.status(200).json({ success: true, data: { message: 'Notification deleted' } });
    } catch (error) {
      next(error);
    }
  };
}
