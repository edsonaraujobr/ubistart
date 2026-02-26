import type { StatusTask } from "@repo/db";

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
