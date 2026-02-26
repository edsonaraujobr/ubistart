import { TaskDatasource } from '@data/tasks/tasks.datasource';
import type { FiltersModel, Paginated } from '@domain/model/common.model';
import type { TaskModelWithOverdue } from '@domain/model/tasks.model';
import { CheckUserUseCase } from '@domain/users/check-user.use-case';
import { isOverdue } from '@domain/utils/is-overdue-task.utils';

async function exec(data: FiltersModel & { userId: string }): Promise<Paginated<TaskModelWithOverdue>> {
  const { limit, offset, userId } = data;

  await CheckUserUseCase.exec(userId);

  const tasksPaginated = await TaskDatasource.findManyFromUser({ userId, limit, offset });

  return {
    count: tasksPaginated.count,
    pageInfo: tasksPaginated.pageInfo,
    nodes: tasksPaginated.nodes.map((task) => ({
      ...task,
      isOverdue: isOverdue(task),
    })),
  }
}

export const GetTasksFromUserUseCase = { exec };
