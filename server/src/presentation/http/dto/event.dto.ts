import { z } from 'zod';
import {
  EventLocationMode,
  EventStatus,
  EventVisibility,
} from '../../../domain/enums/event.enum';

const slugSchema = z
  .string()
  .min(3)
  .max(80)
  .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens');

const locationSchema = z
  .object({
    mode: z.nativeEnum(EventLocationMode),
    venueName: z.string().max(200).optional(),
    address: z.string().max(500).optional(),
    meetingUrl: z.string().url().optional(),
  })
  .superRefine((loc, ctx) => {
    if (
      (loc.mode === EventLocationMode.ONLINE || loc.mode === EventLocationMode.HYBRID) &&
      !loc.meetingUrl
    ) {
      ctx.addIssue({ code: 'custom', message: 'meetingUrl is required for online/hybrid events', path: ['meetingUrl'] });
    }
    if (
      (loc.mode === EventLocationMode.ONSITE || loc.mode === EventLocationMode.HYBRID) &&
      !loc.venueName
    ) {
      ctx.addIssue({ code: 'custom', message: 'venueName is required for onsite/hybrid events', path: ['venueName'] });
    }
  });

const scheduleRefine = (data: { startAt: string; endAt: string; registrationClosesAt?: string }, ctx: z.RefinementCtx) => {
  const start = new Date(data.startAt);
  const end = new Date(data.endAt);
  if (end <= start) {
    ctx.addIssue({ code: 'custom', message: 'endAt must be after startAt', path: ['endAt'] });
  }
  if (data.registrationClosesAt) {
    const closes = new Date(data.registrationClosesAt);
    if (closes > start) {
      ctx.addIssue({
        code: 'custom',
        message: 'registrationClosesAt must be before or equal to startAt',
        path: ['registrationClosesAt'],
      });
    }
  }
};

export const eventSlugParamSchema = z.object({
  collegeSlug: slugSchema,
  eventSlug: slugSchema,
});

export const clubEventParamSchema = z.object({
  collegeSlug: slugSchema,
  clubSlug: slugSchema,
});

export const createEventSchema = z
  .object({
    title: z.string().min(3).max(200),
    slug: slugSchema,
    description: z.string().max(10000).optional(),
    coverImageUrl: z.string().url().optional(),
    location: locationSchema,
    startAt: z.string().datetime(),
    endAt: z.string().datetime(),
    timezone: z.string().min(1).max(64),
    capacity: z.number().int().min(1).optional(),
    registrationOpensAt: z.string().datetime().optional(),
    registrationClosesAt: z.string().datetime().optional(),
    requiresApproval: z.boolean().optional(),
    visibility: z.nativeEnum(EventVisibility).optional(),
    tags: z.array(z.string().max(30)).max(20).optional(),
  })
  .superRefine(scheduleRefine);

export const updateEventSchema = z
  .object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().max(10000).optional(),
    coverImageUrl: z.string().url().optional(),
    location: locationSchema.optional(),
    startAt: z.string().datetime().optional(),
    endAt: z.string().datetime().optional(),
    timezone: z.string().min(1).max(64).optional(),
    capacity: z.number().int().min(1).optional(),
    registrationOpensAt: z.string().datetime().optional(),
    registrationClosesAt: z.string().datetime().optional(),
    requiresApproval: z.boolean().optional(),
    visibility: z.nativeEnum(EventVisibility).optional(),
    tags: z.array(z.string().max(30)).max(20).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startAt && data.endAt) {
      scheduleRefine(
        {
          startAt: data.startAt,
          endAt: data.endAt,
          registrationClosesAt: data.registrationClosesAt,
        },
        ctx,
      );
    }
  });

export const cancelEventSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const listEventsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  clubSlug: slugSchema.optional(),
  status: z.nativeEnum(EventStatus).optional(),
  visibility: z.nativeEnum(EventVisibility).optional(),
  search: z.string().max(100).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  sort: z.string().optional(),
});

export type CreateEventDto = z.infer<typeof createEventSchema>;
export type UpdateEventDto = z.infer<typeof updateEventSchema>;
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;

/** Maps ISO date strings from DTO to Date objects for use cases */
export function parseEventDates(dto: CreateEventDto) {
  return {
    startAt: new Date(dto.startAt),
    endAt: new Date(dto.endAt),
    registrationOpensAt: dto.registrationOpensAt ? new Date(dto.registrationOpensAt) : undefined,
    registrationClosesAt: dto.registrationClosesAt ? new Date(dto.registrationClosesAt) : undefined,
  };
}

export function parseUpdateEventDates(dto: UpdateEventDto) {
  return {
    ...(dto.startAt && { startAt: new Date(dto.startAt) }),
    ...(dto.endAt && { endAt: new Date(dto.endAt) }),
    ...(dto.registrationOpensAt && { registrationOpensAt: new Date(dto.registrationOpensAt) }),
    ...(dto.registrationClosesAt && { registrationClosesAt: new Date(dto.registrationClosesAt) }),
  };
}
