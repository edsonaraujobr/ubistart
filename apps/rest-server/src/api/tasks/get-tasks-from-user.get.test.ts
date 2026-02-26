import { dbClient } from '@data/db.client';
import { expect } from 'chai';
import sinon from 'sinon';
import { clearDatabase } from '@test/db-helper';
import { faker } from '@faker-js/faker';
import { checkErrors } from '@test/checker.test';
import { RequestMaker } from '@test/request-maker.test';
import { createUser } from '@test/entity-seed.test';
import { UserErrors } from '@domain/users/user.errors';
import { StatusTask } from '@repo/db';

describe('GET /tasks', () => {
  const endpoint = '/tasks';
  let requestMaker: RequestMaker<any>;

  before(async () => {
    requestMaker = new RequestMaker();
  });

  afterEach(async () => {
    await clearDatabase();
    sinon.restore();
  });

  it('should return paginated tasks from user with isOverdue flag', async () => {
    const user = await dbClient.user.create({
      data: await createUser({ active: true }),
    });

    // Task futura (não atrasada)
    await dbClient.task.create({
      data: {
        description: 'Future Task',
        endDate: new Date(Date.now() + 1000 * 60 * 60),
        userId: user.id,
      },
    });

    // Task atrasada
    await dbClient.task.create({
      data: {
        description: 'Overdue Task',
        endDate: new Date(Date.now() - 1000 * 60 * 60),
        userId: user.id,
      },
    });

    await requestMaker.auth({ userId: user.id });

    const response = await requestMaker.get({
      endpoint,
      query: { limit: 10, offset: 0 },
      expectedStatus: 200,
    });

    expect(response.data.count).to.eq(2);
    expect(response.data.nodes).to.have.length(2);

    const overdueTask = response.data.nodes.find(
      (t: any) => t.description === 'Overdue Task'
    );

    const futureTask = response.data.nodes.find(
      (t: any) => t.description === 'Future Task'
    );

    expect(overdueTask.isOverdue).to.eq(true);
    expect(futureTask.isOverdue).to.eq(false);
  });

  it('should not mark completed task as overdue', async () => {
    const user = await dbClient.user.create({
      data: await createUser({ active: true }),
    });

    await dbClient.task.create({
      data: {
        description: 'Completed Task',
        endDate: new Date(Date.now() - 1000 * 60 * 60),
        userId: user.id,
        status: StatusTask.COMPLETED,
        finishedAt: new Date(),
      },
    });

    await requestMaker.auth({ userId: user.id });

    const response = await requestMaker.get({
      endpoint,
      query: { limit: 10, offset: 0 },
      expectedStatus: 200,
    });

    expect(response.data.nodes[0].isOverdue).to.eq(false);
  });

  it('should return only user tasks', async () => {
    const user1 = await dbClient.user.create({
      data: await createUser({ active: true }),
    });

    const user2 = await dbClient.user.create({
      data: await createUser({ active: true }),
    });

    await dbClient.task.create({
      data: {
        description: 'User1 Task',
        endDate: faker.date.soon(),
        userId: user1.id,
      },
    });

    await dbClient.task.create({
      data: {
        description: 'User2 Task',
        endDate: faker.date.soon(),
        userId: user2.id,
      },
    });

    await requestMaker.auth({ userId: user1.id });

    const response = await requestMaker.get({
      endpoint,
      query: { limit: 10, offset: 0 },
      expectedStatus: 200,
    });

    expect(response.data.nodes).to.have.length(1);
    expect(response.data.nodes[0].description).to.eq('User1 Task');
  });

  it('should paginate tasks correctly', async () => {
    const user = await dbClient.user.create({
      data: await createUser({ active: true }),
    });

    await dbClient.task.createMany({
      data: Array.from({ length: 12 }).map(() => ({
        description: faker.lorem.sentence(),
        endDate: faker.date.soon(),
        userId: user.id,
      })),
    });

    await requestMaker.auth({ userId: user.id });

    const response = await requestMaker.get({
      endpoint,
      query: { limit: 5, offset: 0 },
      expectedStatus: 200,
    });

    expect(response.data.nodes).to.have.length(5);
    expect(response.data.count).to.eq(12);
    expect(response.data.pageInfo.hasNextPage).to.eq(true);
  });

  it('should return error if user is not authenticated', async () => {
    const response = await requestMaker.get({
      endpoint,
      query: { limit: 10 },
      expectedStatus: 401,
    });

    expect(response.status).to.eq(401);
  });

  it('should return error if user is inactive', async () => {
    const inactiveUser = await dbClient.user.create({
      data: await createUser({ active: false }),
    });

    await requestMaker.auth({ userId: inactiveUser.id });

    const response = await requestMaker.get({
      endpoint,
      query: { limit: 10 },
      expectedStatus: 400,
    });

    checkErrors(response, [UserErrors.UserNotActive]);
  });

  it('should return empty list if user has no tasks', async () => {
    const user = await dbClient.user.create({
      data: await createUser({ active: true }),
    });

    await requestMaker.auth({ userId: user.id });

    const response = await requestMaker.get({
      endpoint,
      query: { limit: 10 },
      expectedStatus: 200,
    });

    expect(response.data.nodes).to.have.length(0);
    expect(response.data.count).to.eq(0);
  });
});
