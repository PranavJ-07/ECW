import { z } from 'zod';
import { ClubCategory, ClubStatus, ClubVisibility } from '../../../domain/enums/club.enum';

const slugSchema = z
  .string()
  .min(3)
  .max(50)
  .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens');

export const collegeSlugParamSchema = z.object({
  collegeSlug: slugSchema,
});

export const clubSlugParamSchema = z.object({
  collegeSlug: slugSchema,
  clubSlug: slugSchema,
});

export const createClubSchema = z.object({
  name: z.string().min(3).max(140),
  slug: slugSchema,
  description: z.string().max(5000).optional(),
  category: z.nativeEnum(ClubCategory),
  tags: z.array(z.string().max(30)).max(20).optional(),
  contactEmail: z.string().email().optional(),
  facultyAdvisorId: z.string().optional(),
  visibility: z.nativeEnum(ClubVisibility).optional(),
});

export const updateClubSchema = z.object({
  name: z.string().min(3).max(140).optional(),
  description: z.string().max(5000).optional(),
  category: z.nativeEnum(ClubCategory).optional(),
  tags: z.array(z.string().max(30)).max(20).optional(),
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  socialLinks: z
    .object({
      instagram: z.string().url().optional(),
      website: z.string().url().optional(),
    })
    .optional(),
  facultyAdvisorId: z.string().optional(),
  visibility: z.nativeEnum(ClubVisibility).optional(),
});

export const listClubsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  category: z.nativeEnum(ClubCategory).optional(),
  status: z.nativeEnum(ClubStatus).optional(),
  search: z.string().max(100).optional(),
  sort: z.string().optional(),
});

export type CreateClubDto = z.infer<typeof createClubSchema>;
export type UpdateClubDto = z.infer<typeof updateClubSchema>;
export type ListClubsQuery = z.infer<typeof listClubsQuerySchema>;
