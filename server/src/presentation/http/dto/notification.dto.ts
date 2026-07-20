import { z } from 'zod';
import { NotificationType } from '../../../domain/enums/notification.enum';

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');

export const notificationIdParamSchema = z.object({
  collegeSlug: z.string().min(3).max(80),
  notificationId: objectIdSchema,
});

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  isRead: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  type: z.nativeEnum(NotificationType).optional(),
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
