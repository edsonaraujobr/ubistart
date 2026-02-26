import { dbClient } from '@data/db.client';
import { expect } from 'chai';
import sinon from 'sinon';
import { clearDatabase } from '@test/db-helper';
import { faker } from '@faker-js/faker';
import { checkErrors } from '@test/checker.test';
import { RequestMaker } from '@test/request-maker.test';
import { createUser } from '@test/entity-seed.test';
import { TasksErrors } from '@domain/tasks/tasks.errors';
import { UserErrors } from '@domain/users/user.errors';

describe('POST /tasks', () => {
  const endpoint = '/tasks/';

  let requestMaker: RequestMaker<any>;

  before(async () => {
    requestMaker = new RequestMaker();
  });

  afterEach(async () => {
    await clearDatabase();
    sinon.restore();
  });

  it('should create task successfully', async () => {
    const user = await dbClient.user.create({
      data: await createUser({ active: true }),
    });

    const body = {
      description: faker.lorem.sentence(),
      endDate: new Date(Date.now() + 1000 * 60 * 60),
    };

    await requestMaker.auth({ userId: user.id });

    const response = await requestMaker.post({
      endpoint,
      body,
    });

    const taskDb = await dbClient.task.findFirst({
      where: { description: body.description },
    });

    expect(response.status).to.eq(201);
    expect(taskDb).to.exist;
    expect(taskDb?.userId).to.eq(user.id);
    expect(taskDb?.description).to.eq(body.description);
  });

  it('should return error if user is not authenticated', async () => {

    const response = await requestMaker.post({
      endpoint,
      body: {
        description: faker.lorem.sentence(),
        endDate: new Date(Date.now() + 1000 * 60 * 60),
      },
      expectedStatus: 401,
    });

    expect(response.status).to.eq(401);
  });

  it('should return error if user is inactive', async () => {
    const user = await dbClient.user.create({
      data: await createUser({ active: false }),
    });

    await requestMaker.auth({ userId: user.id });

    const response = await requestMaker.post({
      endpoint,
      body: {
        description: faker.lorem.sentence(),
        endDate: new Date(Date.now() + 1000 * 60 * 60),
      },
      expectedStatus: 400,
    });

    checkErrors(response, [UserErrors.UserNotActive]);
  });

  it('should return error if endDate is in the past', async () => {
    const user = await dbClient.user.create({
      data: await createUser({ active: true }),
    });

    await requestMaker.auth({ userId: user.id });

    const response = await requestMaker.post({
      endpoint,
      body: {
        description: faker.lorem.sentence(),
        endDate: new Date(Date.now() - 1000),
      },
      expectedStatus: 400,
    });

    checkErrors(response, [TasksErrors.InvalidEndDate]);
  });
});
