import { TaskDatasource } from '@data/tasks/tasks.datasource';
import type { Paginated } from '@domain/model/common.model';
import type { GetTaskFiltersAdvanced, TaskModelWithUserEmailAndOverdue } from '@domain/model/tasks.model';
import { CheckUserUseCase } from '@domain/users/check-user.use-case';
import { isOverdue } from '@domain/utils/is-overdue-task.utils';
import { UnauthorizedError } from '@repo/core/error';
import { TypeUser } from '@repo/db';

async function exec(data: GetTaskFiltersAdvanced & { userId: string }): Promise<Paginated<TaskModelWithUserEmailAndOverdue>> {
  const { limit, offset, userId, onlyOverdue } = data;

  const user = await CheckUserUseCase.exec(userId);

  if (user.typeUser !== TypeUser.ADMIN) {
    throw new UnauthorizedError();
  }

  const tasksPaginated = await TaskDatasource.findManyFromAllUsers({ limit, offset, onlyOverdue  });

  return {
    ...tasksPaginated,
    nodes: tasksPaginated.nodes.map((task) => ({
      ...task,
      isOverdue: isOverdue(task),
    })),
  };
}

export const GetAllTasksUseCase = { exec };
