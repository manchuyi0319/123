import { z } from 'zod';

export const addPointsSchema = z.object({
  body: z.object({
    student_id: z.string().uuid('无效的学生ID'),
    points_change: z.number().int().refine(v => v !== 0, '积分变化不能为0'),
    reason: z.string().min(1, '理由不能为空').max(100),
    category: z.enum(['behavior', 'academic', 'attendance', 'custom', 'feeding']).default('custom'),
    evaluation_rule_id: z.string().uuid().optional().nullable(),
  }),
});
