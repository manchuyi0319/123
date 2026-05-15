import { z } from 'zod';

export const updateSemesterRewardsSchema = z.object({
  body: z.object({
    rewards: z.array(z.object({
      id: z.string().optional(),
      category: z.enum(['students', 'pets', 'classes']),
      rank_start: z.number().int().min(1),
      rank_end: z.number().int().min(1),
      reward: z.string().min(1, '奖励内容不能为空').max(200, '奖励描述不能超过200字'),
    })).min(1).max(30),
  }),
});
