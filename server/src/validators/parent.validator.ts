import { z } from 'zod';

export const parentRegisterSchema = z.object({
  body: z.object({
    email: z.string().email('请输入有效的邮箱'),
    password: z.string().min(4, '密码长度不能少于4位'),
    display_name: z.string().min(1, '请输入姓名'),
    invite_code: z.string().min(6, '请输入邀请码'),
  }),
});

export const joinRequestSchema = z.object({
  body: z.object({
    student_id: z.string().min(1, '请选择学生'),
    message: z.string().optional(),
  }),
});

export const approveRejectSchema = z.object({
  body: z.object({
    status: z.enum(['approved', 'rejected']),
  }),
});
