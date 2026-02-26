import { dbClient } from '@data/db.client';
import { DAY_MILLISECONDS } from '@domain/constants';
import type { Message } from '@domain/model/common.model';
import { Env } from '@env';
import { faker } from '@faker-js/faker';
import { GlobalErrors } from '@repo/core/error';
import { Localization } from '@repo/core/localization';
import type { User } from '@repo/db';
import { checkErrors } from '@test/checker.test.js';
import { clearDatabase } from '@test/db-helper';
import { createUser } from '@test/entity-seed.test';
import { RequestMaker } from '@test/request-maker.test.js';
import { isDefined } from '@test/utils/is-defined';
import { expect } from 'chai';

describe('DELETE /users/logout', () => {
  const endpoint = '/users/logout';

  let requestMaker: RequestMaker<Message>;
  let user: User;

  before(async () => {
    requestMaker = new RequestMaker();
  });

  beforeEach(async () => {
    const userInput = await createUser();
    user = await dbClient.user.create({ data: userInput });

  });


  afterEach(async () => {
    await clearDatabase()
  });

  it('should logout successfully', async () => {
    const sessionDurationDays = Number.parseInt(Env.SESSION_DURATION);
    const expirationDate = new Date(Date.now() + sessionDurationDays * DAY_MILLISECONDS);

    const newSession = await dbClient.session.create({
      data: { userId: user.id, expiresIn: expirationDate },
    });

    await requestMaker.auth({ userId: user.id, sessionId: newSession.id });
    const response = await requestMaker.delete({ endpoint, body: {} });

    const sessionDb = await dbClient.session.findUnique({ where: { id: newSession.id, userId: user.id } });
    const responseData = response.data;

    isDefined(responseData);
    expect(sessionDb).to.eq(null);
    expect(responseData.message).to.eq(Localization.__('users.success.logout'));
  });

  it('should give an error if session is not found', async () => {
    await requestMaker.auth({ userId: user.id, sessionId: faker.string.uuid() });
    const response = await requestMaker.delete({
      endpoint,
      body: {},
      expectedStatus: 401,
    });

    checkErrors(response, [GlobalErrors.Unauthorized]);
  });

  it('should give an error if credentials are not send', async () => {
    const response = await requestMaker.delete({
      endpoint,
      body: {},
      expectedStatus: 401,
    });

    checkErrors(response, [GlobalErrors.Unauthorized]);
  });

  it('should give an error if userId different from user session id', async () => {
    const input = await createUser();
    const otherUser = await dbClient.user.create({ data: input });

    const sessionDurationDays = Number.parseInt(Env.SESSION_DURATION);
    const expirationDate = new Date(Date.now() + sessionDurationDays * DAY_MILLISECONDS);

    const otherSession = await dbClient.session.create({
      data: { userId: otherUser.id, expiresIn: expirationDate },
    });

    await requestMaker.auth({ userId: user.id, sessionId: otherSession.id });
    const response = await requestMaker.delete({
      endpoint,
      body: {},
      expectedStatus: 401,
    });

    checkErrors(response, [GlobalErrors.Unauthorized]);
  });
});
