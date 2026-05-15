import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  body: z.object({
    title: z.string().min(1, '标题不能为空').max(100, '标题不能超过100字'),
    content: z.string().min(1, '内容不能为空').max(2000, '内容不能超过2000字'),
    is_pinned: z.number().int().min(0).max(1).optional(),
  }),
});

export const updateAnnouncementSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(100).optional(),
    content: z.string().min(1).max(2000).optional(),
    is_pinned: z.number().int().min(0).max(1).optional(),
  }),
});
