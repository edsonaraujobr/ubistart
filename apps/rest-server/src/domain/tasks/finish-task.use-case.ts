import { TaskDatasource } from '@data/tasks/tasks.datasource';
import { InvalidDataError, NotFoundError, UnauthorizedError } from '@repo/core/error';
import { TasksErrors } from './tasks.errors';
import type { TaskModel } from '@domain/model/tasks.model';
import { StatusTask } from '@repo/db';
import { CheckUserUseCase } from '@domain/users/check-user.use-case';

async function exec({
  taskId,
  userId,
}: {
  taskId: string;
  userId: string;
}): Promise<TaskModel> {
  const task = await TaskDatasource.findById(taskId);

  if (!task) {
    throw new NotFoundError(TasksErrors.NotFoundError);
  }

  if (task.userId !== userId) {
    throw new UnauthorizedError(TasksErrors.UnauthorizedError);
  }

  await CheckUserUseCase.exec(userId);

  if (task.status === StatusTask.COMPLETED) {
    throw new InvalidDataError(TasksErrors.TaskAlreadyFinished);
  }

  return TaskDatasource.finishTask(taskId);
}

export const FinishTaskUseCase = { exec };
