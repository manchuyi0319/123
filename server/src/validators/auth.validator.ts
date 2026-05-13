import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(1, '用户名不能为空'),
    password: z.string().min(1, '密码不能为空'),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(2, '用户名至少2个字符'),
    password: z.string().min(4, '密码至少4个字符'),
    display_name: z.string().min(1, '显示名称不能为空'),
  }),
});
