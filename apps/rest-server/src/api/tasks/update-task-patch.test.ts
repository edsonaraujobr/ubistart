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

describe('PATCH /tasks/:taskId', () => {
  let requestMaker: RequestMaker<any>;

  before(async () => {
    requestMaker = new RequestMaker();
  });

  afterEach(async () => {
    await clearDatabase();
    sinon.restore();
  });

  it('should update description successfully', async () => {
    const user = await dbClient.user.create({
      data: await createUser({ active: true }),
    });

    const task = await dbClient.task.create({
      data: {
        description: 'Old description',
        endDate: new Date(Date.now() + 1000 * 60 * 60),
        userId: user.id,
      },
    });

    await requestMaker.auth({ userId: user.id });

    const newDescription = faker.lorem.sentence();

    const response = await requestMaker.patch({
      endpoint: `/tasks/${task.id}`,
      body: { description: newDescription },
    });

    const taskDb = await dbClient.task.findUnique({
      where: { id: task.id },
    });

    expect(response.status).to.eq(200);
    expect(taskDb?.description).to.eq(newDescription);
  });

  it('should update endDate successfully', async () => {
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

    const newEndDate = new Date(Date.now() + 1000 * 60 * 60 * 2);

    const response = await requestMaker.patch({
      endpoint: `/tasks/${task.id}`,
      body: { endDate: newEndDate },
    });

    const taskDb = await dbClient.task.findUnique({
      where: { id: task.id },
    });

    expect(response.status).to.eq(200);
    expect(taskDb?.endDate.getTime()).to.eq(newEndDate.getTime());
  });

  it('should return error if user is not authenticated', async () => {
    const response = await requestMaker.patch({
      endpoint: `/tasks/${faker.string.uuid()}`,
      body: { description: 'Test' },
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
      endpoint: `/tasks/${faker.string.uuid()}`,
      body: { description: 'Test' },
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
      endpoint: `/tasks/${task.id}`,
      body: { description: 'Hack attempt' },
      expectedStatus: 401,
    });

    checkErrors(response, [TasksErrors.UnauthorizedError]);
  });

  it('should return error if task is completed', async () => {
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
      endpoint: `/tasks/${task.id}`,
      body: { description: 'New desc' },
      expectedStatus: 400,
    });

    checkErrors(response, [TasksErrors.TaskAlreadyFinished]);
  });

  it('should return error if endDate is in the past', async () => {
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

    const pastDate = new Date(Date.now() - 1000 * 60);

    const response = await requestMaker.patch({
      endpoint: `/tasks/${task.id}`,
      body: { endDate: pastDate },
      expectedStatus: 400,
    });

    checkErrors(response, [TasksErrors.InvalidEndDate]);
  });
});
