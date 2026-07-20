import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one digit');

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: passwordSchema,
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  collegeSlug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Invalid college slug'),
  department: z.string().max(120).optional(),
  academicYear: z.number().int().min(1).max(8).optional(),
  studentId: z.string().max(50).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  collegeSlug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Invalid college slug'),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
