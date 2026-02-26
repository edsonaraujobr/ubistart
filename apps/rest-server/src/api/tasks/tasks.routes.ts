import type { Routes } from '@api/routes.js';
import { ContextProvider } from '@repo/core/context';
import type { ServerContext } from '@domain/model/context.model.js';
import type { GetTaskFiltersAdvanced, TaskInput, TaskModel, TaskModelWithOverdue, TaskModelWithUserEmailAndOverdue } from '@domain/model/tasks.model';
import { UnauthorizedError } from '@repo/core/error';
import { filterAdvancedGetTasks, getAllTasksSchema, getTasksSchema, taskIdParamsSchema, taskInputSchema, taskModelSchema, updateTaskBodySchema } from './tasks.schema';
import { CreateTaskUseCase } from '@domain/tasks/create-task.use-case';
import { FinishTaskUseCase } from '@domain/tasks/finish-task.use-case';
import { UpdateTaskUseCase } from '@domain/tasks/update-task.use-case';
import type { FiltersModel, Paginated } from '@domain/model/common.model';
import { GetTasksFromUserUseCase } from '@domain/tasks/get-tasks-from-user.use-case';
import { filterInputSchema } from '@api/common/common.schema';
import { GetAllTasksUseCase } from '@domain/tasks/get-all-tasks.use-case';
import { AuthorizationMiddleware } from '@api/authorization.middleware';

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
      beforeMiddlewares: [AuthorizationMiddleware],
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
      beforeMiddlewares: [AuthorizationMiddleware],
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
      beforeMiddlewares: [AuthorizationMiddleware],
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

  {
    base: '/tasks',
    get: {
      endpoint: '/',
      schema: {
        querystring: filterInputSchema,
        response: { 200: getTasksSchema },
        tags: ['tasks'],
        description: "Busca todas as tasks do usuário paginado.",
        summary: "Busca todas as tasks do usuário paginado."
      },
      beforeMiddlewares: [AuthorizationMiddleware],
      handler: ({ query }: { query: FiltersModel }): Promise<Paginated<TaskModelWithOverdue>> => {
        const userId = ContextProvider.getInstance<ServerContext>().get().userId;
        if (!userId) throw new UnauthorizedError();

        return GetTasksFromUserUseCase.exec({ userId, ...query });
      },
    },
  },

  {
    base: '/tasks',
    get: {
      endpoint: '/all',
      schema: {
        querystring: filterAdvancedGetTasks,
        response: { 200: getAllTasksSchema },
        tags: ['tasks'],
        description: "Busca todas as tasks de todos usuários.",
        summary: "Busca todas as tasks de todos usuários. Com filtro opcional de tarefas atrasadas"
      },
      beforeMiddlewares: [AuthorizationMiddleware],
      handler: ({ query }: { query: GetTaskFiltersAdvanced }): Promise<Paginated<TaskModelWithUserEmailAndOverdue>> => {
        const userId = ContextProvider.getInstance<ServerContext>().get().userId;
        if (!userId) throw new UnauthorizedError();

        return GetAllTasksUseCase.exec({ userId, ...query });
      },
    },
  },

];
