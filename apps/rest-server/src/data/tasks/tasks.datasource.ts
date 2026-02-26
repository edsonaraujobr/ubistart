import { dbClient } from "@data/db.client";
import type { TaskInput, TaskModel, TaskModelWithUserId, UpdateTaskInput } from "@domain/model/tasks.model";
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

export const TaskDatasource = {
  createTask,
  findById,
  finishTask,
  updateTask
}
