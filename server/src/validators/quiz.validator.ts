import { z } from 'zod';

export const submitAnswerSchema = z.object({
  body: z.object({
    student_id: z.string().min(1),
    question_id: z.string().min(1),
    selected_answer: z.number().int().min(0).max(3),
  }),
});
