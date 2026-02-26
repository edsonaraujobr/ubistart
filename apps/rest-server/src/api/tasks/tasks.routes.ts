import type { Routes } from '@api/routes.js';
import { ContextProvider } from '@repo/core/context';
import type { ServerContext } from '@domain/model/context.model.js';
import type { TaskInput, TaskModel } from '@domain/model/tasks.model';
import { UnauthorizedError } from '@repo/core/error';
import { taskIdParamsSchema, taskInputSchema, taskModelSchema, updateTaskBodySchema } from './tasks.schema';
import { CreateTaskUseCase } from '@domain/tasks/create-task.use-case';
import { FinishTaskUseCase } from '@domain/tasks/finish-task.use-case';
import { UpdateTaskUseCase } from '@domain/tasks/update-task.use-case';

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

  {
    base: '/tasks',
    patch: {
      endpoint: '/:taskId/finish',
      schema: {
        params: taskIdParamsSchema,
        response: { 200: taskModelSchema },
        tags: ['tasks'],
        description: 'Finaliza uma tarefa',
        summary: 'Marca a tarefa como concluída',
      },
      handler: ({ params }: { params: { taskId: string } }): Promise<TaskModel> => {
        const { userId } =
          ContextProvider.getInstance<ServerContext>().get();
  
        if (!userId) {
          throw new UnauthorizedError();
        }
  
        return FinishTaskUseCase.exec({
          taskId: params.taskId,
          userId,
        });
      },
    },
  },

  {
    base: '/tasks',
    patch: {
      endpoint: '/:taskId',
      schema: {
        params: taskIdParamsSchema,
        body: updateTaskBodySchema,
        response: { 200: taskModelSchema },
        tags: ['tasks'],
        description: 'Atualiza uma tarefa',
        summary: 'Atualiza descrição e/ou prazo de uma tarefa',
      },
      handler: ({
        params,
        body,
      }: {
        params: { taskId: string };
        body: { description?: string; endDate?: Date };
      }): Promise<TaskModel> => {
        const { userId } =
          ContextProvider.getInstance<ServerContext>().get();
  
        if (!userId) {
          throw new UnauthorizedError();
        }
  
        return UpdateTaskUseCase.exec({
          taskId: params.taskId,
          userId,
          ...body,
        });
      },
    },
  },

];
