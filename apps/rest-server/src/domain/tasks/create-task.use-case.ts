import type { TaskInput, TaskModel } from '@domain/model/tasks.model';
import { CheckUserUseCase } from '@domain/users/check-user.use-case';
import { InvalidDataError } from '@repo/core/error';
import { TasksErrors } from './tasks.errors';
import { TaskDatasource } from '@data/tasks/tasks.datasource';

async function exec(body: TaskInput & { userId: string }): Promise<TaskModel> {
  await CheckUserUseCase.exec(body.userId);

  const { description, endDate, userId } = body;

  const now = new Date();

  if (endDate.getTime() <= now.getTime()) {
    throw new InvalidDataError(TasksErrors.InvalidEndDate);
  }

  const newTask = await TaskDatasource.createTask({
    description,
    endDate,
    userId
  });

  return newTask;
}

export const CreateTaskUseCase = { exec };
