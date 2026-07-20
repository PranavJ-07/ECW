import { z } from 'zod';

const slugSchema = z
  .string()
  .min(3)
  .max(80)
  .regex(/^[a-z0-9-]+$/, 'Invalid slug format');

export const eventSlugParamSchema = z.object({
  collegeSlug: slugSchema,
  eventSlug: slugSchema,
});

export const scanAttendanceQrSchema = z.object({
  token: z.string().min(20, 'QR token is required'),
});

export const listAttendanceQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type ScanAttendanceQrDto = z.infer<typeof scanAttendanceQrSchema>;
export type ListAttendanceQuery = z.infer<typeof listAttendanceQuerySchema>;
