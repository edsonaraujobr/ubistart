export const TasksErrors = {
  InvalidEndDate: { code: 'TASK_01', message: 'tasks.error.invalid-end-date' },
  UnauthorizedError: { code: 'TASK_02', message: 'tasks.error.unauthorized' },
  TaskAlreadyFinished: { code: 'TASK_03', message: 'tasks.error.task-already-finished' },
  NotFoundError: { code: 'TASK_04', message: 'tasks.error.not-found' },
} as const;
