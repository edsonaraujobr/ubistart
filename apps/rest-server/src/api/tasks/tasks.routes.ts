import type { Routes } from '@api/routes.js';
import { ContextProvider } from '@repo/core/context';
import type { ServerContext } from '@domain/model/context.model.js';
import type { TaskInput, TaskModel } from '@domain/model/tasks.model';
import { UnauthorizedError } from '@repo/core/error';
import { taskInputSchema, taskModelSchema } from './tasks.schema';
import { CreateTaskUseCase } from '@domain/tasks/create-task.use-case';

export const TasksRoutes: Routes[] = [
  {
    base: '/tasks',
    post: {
      endpoint: '/',
      schema: {
        body: taskInputSchema,
        response: { 201: taskModelSchema },
        tags: ['tasks'],
        description: 'Cria um nova tarefa na plataforma',
        summary: 'Cria um nova tarefa na plataforma',
      },
      handler: ({ body }: { body: TaskInput }): Promise<TaskModel> => {
        const { userId } = ContextProvider.getInstance<ServerContext>().get();

        if (!userId) {
          throw new UnauthorizedError();
        }

        return CreateTaskUseCase.exec({ ...body, userId });
      },
    },
  },

];
