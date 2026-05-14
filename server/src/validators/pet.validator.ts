import { z } from 'zod';

export const adoptPetSchema = z.object({
  body: z.object({
    student_id: z.string().uuid(),
    pet_id: z.string().uuid(),
    nickname: z.string().max(20).optional().nullable(),
  }),
});

export const feedPetSchema = z.object({
  body: z.object({
    student_pet_id: z.string().uuid(),
  }),
});
