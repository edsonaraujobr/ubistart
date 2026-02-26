import type { StatusTask } from "@repo/db";
import type { FiltersModel } from "./common.model";

export interface TaskModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  finishedAt: Date | null;
  status: StatusTask;
  description: string;
  endDate: Date;
}

export interface TaskInput {
  description: string;
  endDate: Date;
}

export interface TaskModelWithUserId extends TaskModel {
  userId: string;
}

export interface UpdateTaskInput {
  description?: string;
  endDate?: Date;
  taskId: string;
}

export interface TaskModelWithOverdue extends TaskModel {
  isOverdue: boolean;
}

export interface TaskModelWithUserEmail extends TaskModel {
  userEmail: string;
}

export interface TaskModelWithUserEmailAndOverdue extends TaskModelWithUserEmail, TaskModelWithOverdue {}

export interface GetTaskFiltersAdvanced extends FiltersModel {
  onlyOverdue?: boolean;
}
