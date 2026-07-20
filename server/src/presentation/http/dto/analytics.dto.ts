import { z } from 'zod';

const slugSchema = z
  .string()
  .min(3)
  .max(80)
  .regex(/^[a-z0-9-]+$/, 'Invalid slug format');

export const collegeSlugParamSchema = z.object({
  collegeSlug: slugSchema,
});

export const clubSlugParamSchema = z.object({
  collegeSlug: slugSchema,
  clubSlug: slugSchema,
});

export const eventSlugParamSchema = z.object({
  collegeSlug: slugSchema,
  eventSlug: slugSchema,
});

export const analyticsDateRangeQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type AnalyticsDateRangeQuery = z.infer<typeof analyticsDateRangeQuerySchema>;
