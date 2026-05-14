import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('请输入有效的邮箱地址'),
    password: z.string().min(1, '密码不能为空'),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('请输入有效的邮箱地址'),
    password: z.string().min(4, '密码至少4个字符'),
    display_name: z.string().min(1, '显示名称不能为空'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    display_name: z.string().min(1).optional(),
    email: z.string().email().optional().nullable(),
    phone: z.string().max(30).optional().nullable(),
    school: z.string().max(100).optional().nullable(),
    bio: z.string().max(500).optional().nullable(),
    avatar_url: z.string().max(500).optional().nullable(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    old_password: z.string().min(1, '旧密码不能为空'),
    new_password: z.string().min(4, '新密码至少4个字符'),
  }),
});
