import { dbClient } from "@data/db.client";
import { buildPageInfo, type FiltersModel, type Paginated } from "@domain/model/common.model";
import type { GetTaskFiltersAdvanced, TaskInput, TaskModel, TaskModelWithUserEmail, TaskModelWithUserId, UpdateTaskInput } from "@domain/model/tasks.model";
import { StatusTask } from "@repo/db";

async function createTask(body: TaskInput & { userId: string }): Promise<TaskModel> {
  const { description, endDate, userId } = body;

  const task = await dbClient.task.create({
    data: { 
      description,
      endDate,
      userId,
    }
  })

  return task;
}

async function findById(taskId: string): Promise<TaskModelWithUserId | null> {
  const task = await dbClient.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    return null;
  }

  return {
    ...task,
    userId: task.userId,
  };
}

async function finishTask(taskId: string): Promise<TaskModel> {
  return dbClient.task.update({
    where: { id: taskId },
    data: {
      status: StatusTask.COMPLETED,
      finishedAt: new Date(),
    },
  });
}

async function updateTask(data: UpdateTaskInput): Promise<TaskModel> {
  const { taskId, description, endDate } = data;

  return dbClient.task.update({
    where: { id: taskId },
    data: {
      description,
      endDate,
    }
  });
}

async function findManyFromUser(input: FiltersModel & { userId: string }): Promise<Paginated<TaskModel>> {
  const offset = Number(input.offset) || 0;
  const limit = Number(input.limit) || 10;

  const [tasksDb, count] = await Promise.all([
    dbClient.task.findMany({
      where: { userId: input.userId },
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    dbClient.task.count({ where: { userId: input.userId } }),
  ]);

  const pageInfo = buildPageInfo({ offset, limit }, count);

  return {
    count,
    nodes: tasksDb,
    pageInfo,
  }
}

async function findManyFromAllUsers(input: GetTaskFiltersAdvanced): Promise<Paginated<TaskModelWithUserEmail>> {
  const { onlyOverdue } = input; 

  const offset = Number(input.offset) || 0;
  const limit = Number(input.limit) || 10;

  const where: any = {};

  if ( onlyOverdue && onlyOverdue === true) {
    where.status = { not: StatusTask.COMPLETED };
    where.endDate = { lt: new Date() };
  }

  const [tasksDb, count] = await Promise.all([
    dbClient.task.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
          }
        }
      }
    }),
    dbClient.task.count({ where }),
  ]);

  const pageInfo = buildPageInfo({ offset, limit }, count);

  return {
    count,
    nodes: tasksDb.map((task) => ({
      ...task,
      userEmail: task.user.email,
    })),
    pageInfo,
  }
}

export const TaskDatasource = {
  createTask,
  findById,
  finishTask,
  updateTask,
  findManyFromUser,
  findManyFromAllUsers
}
