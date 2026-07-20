import { z } from 'zod';
import { CertificateStatus } from '../../../domain/enums/certificate.enum';

const slugSchema = z
  .string()
  .min(3)
  .max(80)
  .regex(/^[a-z0-9-]+$/, 'Invalid slug format');

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');

export const eventSlugParamSchema = z.object({
  collegeSlug: slugSchema,
  eventSlug: slugSchema,
});

export const certificateIdParamSchema = z.object({
  collegeSlug: slugSchema,
  certificateId: objectIdSchema,
});

export const eventCertificateIdParamSchema = z.object({
  collegeSlug: slugSchema,
  eventSlug: slugSchema,
  certificateId: objectIdSchema,
});

export const issueCertificatesSchema = z.object({
  userIds: z.array(objectIdSchema).min(1).max(100).optional(),
});

export const revokeCertificateSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const listCertificatesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.nativeEnum(CertificateStatus).optional(),
});

export const verifyCertificateParamSchema = z.object({
  verificationCode: z.string().min(16).max(64),
});

export type IssueCertificatesDto = z.infer<typeof issueCertificatesSchema>;
export type RevokeCertificateDto = z.infer<typeof revokeCertificateSchema>;
export type ListCertificatesQuery = z.infer<typeof listCertificatesQuerySchema>;
