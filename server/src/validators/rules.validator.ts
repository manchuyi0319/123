import { z } from 'zod';

export const createRuleSchema = z.object({
  body: z.object({
    name: z.string().min(1, '规则名称不能为空').max(30),
    description: z.string().max(100).optional().nullable(),
    points_value: z.number().int().refine(v => v !== 0, '积分值不能为0'),
    category: z.enum(['behavior', 'academic', 'attendance', 'custom']),
    icon: z.string().max(10).optional().nullable(),
  }),
});

export const updateRuleSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(30).optional(),
    description: z.string().max(100).optional().nullable(),
    points_value: z.number().int().refine(v => v !== 0, '积分值不能为0').optional(),
    category: z.enum(['behavior', 'academic', 'attendance', 'custom']).optional(),
    icon: z.string().max(10).optional().nullable(),
  }),
});
