import { filterInputSchema, paginatedSchema } from '@api/common/common.schema';
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

export const taskModelWithOverdue = taskModelSchema.extend({
  isOverdue: z.boolean(),
});

export const taskModelWithUserEmailAndOverdue = taskModelWithOverdue.extend({
  userEmail: z.string(),
});

export const filterAdvancedGetTasks = filterInputSchema.extend({
  onlyOverdue: z.string().transform((value) => value === 'true')
});

export const getTasksSchema = paginatedSchema.extend({ nodes: z.array(taskModelWithOverdue) });

export const getAllTasksSchema = paginatedSchema.extend({ nodes: z.array(taskModelWithUserEmailAndOverdue) });
