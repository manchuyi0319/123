import { z } from 'zod';

export const rankingsQuerySchema = z.object({
  query: z.object({
    class_id: z.string().uuid('无效的班级ID').optional(),
    scope: z.enum(['my', 'all']).optional(),
  }),
});
