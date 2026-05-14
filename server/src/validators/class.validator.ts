import { z } from 'zod';

export const createClassSchema = z.object({
  body: z.object({
    name: z.string().min(1, '班级名称不能为空').max(50, '班级名称不能超过50字'),
    grade: z.string().max(20).optional().nullable(),
    school: z.string().max(100).optional().nullable(),
    description: z.string().max(200).optional().nullable(),
  }),
});

export const updateClassSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50).optional(),
    grade: z.string().max(20).optional().nullable(),
    school: z.string().max(100).optional().nullable(),
    description: z.string().max(200).optional().nullable(),
  }),
});
