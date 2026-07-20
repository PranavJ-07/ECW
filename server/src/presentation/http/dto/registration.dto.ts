import { z } from 'zod';
import { RegistrationStatus } from '../../../domain/enums/registration.enum';

const slugSchema = z
  .string()
  .min(3)
  .max(80)
  .regex(/^[a-z0-9-]+$/, 'Invalid slug format');

export const eventSlugParamSchema = z.object({
  collegeSlug: slugSchema,
  eventSlug: slugSchema,
});

export const registerForEventSchema = z.object({
  idempotencyKey: z.string().uuid().optional(),
});

export const checkInSchema = z
  .object({
    registrationId: z.string().optional(),
    userId: z.string().optional(),
  })
  .refine((data) => data.registrationId || data.userId, {
    message: 'Either registrationId or userId is required',
  });

export const listRegistrationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.nativeEnum(RegistrationStatus).optional(),
  search: z.string().max(100).optional(),
});

export const myRegistrationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.nativeEnum(RegistrationStatus).optional(),
});

export type RegisterForEventDto = z.infer<typeof registerForEventSchema>;
export type CheckInDto = z.infer<typeof checkInSchema>;
export type ListRegistrationsQuery = z.infer<typeof listRegistrationsQuerySchema>;
export type MyRegistrationsQuery = z.infer<typeof myRegistrationsQuerySchema>;
