import { dbClient } from "@data/db.client";
import type { TaskInput, TaskModel } from "@domain/model/tasks.model";

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

export const TaskDatasource = {
  createTask,
}
