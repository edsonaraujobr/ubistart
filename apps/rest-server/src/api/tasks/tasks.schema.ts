import { StatusTask } from '@repo/db';
import { z } from 'zod';

export const taskModelSchema = z.object({
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  finishedAt: z.coerce.date().nullable(),
  status: z.nativeEnum(StatusTask),
  description: z.string(),
  endDate: z.coerce.date(),
});

export const taskInputSchema = z.object({
  description: z.string({ message: 'tasks.error.required-description' }),
  endDate: z.coerce.date({
    message: 'tasks.error.required-end-date',
  }),
});

export const taskIdParamsSchema = z.object({
  taskId: z.string({ message: 'tasks.error.required-task-id' }),
});

export const updateTaskBodySchema = z.object({
  description: z.string().optional(),
  endDate: z.coerce.date().optional(),
});
