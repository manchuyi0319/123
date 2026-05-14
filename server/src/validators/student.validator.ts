import { z } from 'zod';

export const createStudentSchema = z.object({
  body: z.object({
    class_id: z.string().uuid('无效的班级ID'),
    name: z.string().min(1, '学生姓名不能为空').max(30, '姓名不能超过30字'),
    student_number: z.string().max(20).optional().nullable(),
    avatar_url: z.string().max(200).optional().nullable(),
  }),
});

export const updateStudentSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(30).optional(),
    student_number: z.string().max(20).optional().nullable(),
    avatar_url: z.string().max(200).optional().nullable(),
  }),
});

export const batchCreateSchema = z.object({
  body: z.object({
    class_id: z.string().uuid('无效的班级ID'),
    names: z.array(z.string().min(1).max(30)).min(1, '至少需要一个学生姓名').max(50, '单次最多导入50名学生'),
  }),
});
