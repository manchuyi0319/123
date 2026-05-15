import { z } from 'zod';

export const createBulletinPostSchema = z.object({
  body: z.object({
    title: z.string().min(1, '标题不能为空').max(100, '标题不能超过100字'),
    content: z.string().min(1, '内容不能为空').max(5000, '内容不能超过5000字'),
  }),
});
