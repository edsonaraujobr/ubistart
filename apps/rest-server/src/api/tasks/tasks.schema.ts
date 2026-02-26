import { StatusTask } from '@repo/db';
import { z } from 'zod';

export const taskModelSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  finishedAt: z.date().nullable(),
  status: z.nativeEnum(StatusTask),
  description: z.string(),
  endDate: z.date(),
});

export const taskInputSchema = z.object({
  description: z.string({ message: 'tasks.error.required-description' }),
  endDate: z.coerce.date({
    message: 'tasks.error.required-end-date',
  }),
});
