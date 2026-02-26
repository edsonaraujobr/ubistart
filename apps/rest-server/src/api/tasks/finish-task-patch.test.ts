import { dbClient } from '@data/db.client';
import { expect } from 'chai';
import sinon from 'sinon';
import { clearDatabase } from '@test/db-helper';
import { faker } from '@faker-js/faker';
import { checkErrors } from '@test/checker.test';
import { RequestMaker } from '@test/request-maker.test';
import { createUser } from '@test/entity-seed.test';
import { TasksErrors } from '@domain/tasks/tasks.errors';
import { StatusTask } from '@repo/db';

describe('PATCH /tasks/:taskId/finish', () => {
  let requestMaker: RequestMaker<any>;

  before(async () => {
    requestMaker = new RequestMaker();
  });

  afterEach(async () => {
    await clearDatabase();
    sinon.restore();
  });

  it('should finish task successfully', async () => {
    const user = await dbClient.user.create({
      data: await createUser({ active: true }),
    });

    const task = await dbClient.task.create({
      data: {
        description: faker.lorem.sentence(),
        endDate: new Date(Date.now() + 1000 * 60 * 60),
        userId: user.id,
      },
    });

    await requestMaker.auth({ userId: user.id });

    const response = await requestMaker.patch({
      endpoint: `/tasks/${task.id}/finish`,
      
    });

    const taskDb = await dbClient.task.findUnique({
      where: { id: task.id },
    });

    expect(response.status).to.eq(200);
    expect(taskDb?.status).to.eq(StatusTask.COMPLETED);
    expect(taskDb?.finishedAt).to.exist;
  });

  it('should return error if user is not authenticated', async () => {
    const taskId = faker.string.uuid();

    const response = await requestMaker.patch({
      endpoint: `/tasks/${taskId}/finish`,
      expectedStatus: 401,
    });

    expect(response.status).to.eq(401);
  });

  it('should return error if task does not exist', async () => {
    const user = await dbClient.user.create({
      data: await createUser({ active: true }),
    });

    await requestMaker.auth({ userId: user.id });

    const response = await requestMaker.patch({
      endpoint: `/tasks/${faker.string.uuid()}/finish`,
      expectedStatus: 404,
    });

    checkErrors(response, [TasksErrors.NotFoundError]);
  });

  it('should return error if task belongs to another user', async () => {
    const user1 = await dbClient.user.create({
      data: await createUser({ active: true }),
    });

    const user2 = await dbClient.user.create({
      data: await createUser({ active: true }),
    });

    const task = await dbClient.task.create({
      data: {
        description: faker.lorem.sentence(),
        endDate: new Date(Date.now() + 1000 * 60 * 60),
        userId: user1.id,
      },
    });

    await requestMaker.auth({ userId: user2.id });

    const response = await requestMaker.patch({
      endpoint: `/tasks/${task.id}/finish`,
      expectedStatus: 401,
    });

    checkErrors(response, [TasksErrors.UnauthorizedError]);
  });

  it('should return error if task is already completed', async () => {
    const user = await dbClient.user.create({
      data: await createUser({ active: true }),
    });

    const task = await dbClient.task.create({
      data: {
        description: faker.lorem.sentence(),
        endDate: new Date(Date.now() + 1000 * 60 * 60),
        userId: user.id,
        status: StatusTask.COMPLETED,
        finishedAt: new Date(),
      },
    });

    await requestMaker.auth({ userId: user.id });

    const response = await requestMaker.patch({
      endpoint: `/tasks/${task.id}/finish`,
      expectedStatus: 400,
    });

    checkErrors(response, [TasksErrors.TaskAlreadyFinished]);
  });
});
