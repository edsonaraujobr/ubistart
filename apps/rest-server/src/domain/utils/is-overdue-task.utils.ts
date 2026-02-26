import type { TaskModel } from "@domain/model/tasks.model";
import { StatusTask } from "@repo/db";

export function isOverdue(task: TaskModel): boolean {
  return (
    task.status !== StatusTask.COMPLETED &&
    task.endDate.getTime() < Date.now()
  );
}
