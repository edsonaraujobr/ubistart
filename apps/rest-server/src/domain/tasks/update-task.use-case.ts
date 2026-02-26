import { TaskDatasource } from '@data/tasks/tasks.datasource';
import { InvalidDataError, NotFoundError, UnauthorizedError } from '@repo/core/error';
import { TasksErrors } from './tasks.errors';
import type { TaskModel, UpdateTaskInput } from '@domain/model/tasks.model';
import { StatusTask } from '@repo/db';
import { CheckUserUseCase } from '@domain/users/check-user.use-case';

async function exec(data: UpdateTaskInput & { userId }): Promise<TaskModel> {
  const { taskId, description, endDate, userId } = data;

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

  const now = new Date();

  if (endDate != null && endDate.getTime() <= now.getTime()) {
    throw new InvalidDataError(TasksErrors.InvalidEndDate);
  }

  return TaskDatasource.updateTask({ taskId, description, endDate });
}

export const UpdateTaskUseCase = { exec };
