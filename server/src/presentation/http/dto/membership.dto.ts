import { z } from 'zod';

export const myClubsQuerySchema = z.object({
  officerOnly: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value !== 'false'),
});

export type MyClubsQuery = z.infer<typeof myClubsQuerySchema>;
