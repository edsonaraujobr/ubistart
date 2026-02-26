import { dbClient } from '@data/db.client';
import type { AuthCredentials } from '@domain/model';
import { UserErrors } from '@domain/users/user.errors';
import { checkErrors, checkLogin } from '@test/checker.test.js';
import { clearDatabase } from '@test/db-helper';
import { createUser } from '@test/entity-seed.test';
import { RequestMaker } from '@test/request-maker.test.js';
import { isDefined } from '@test/utils/is-defined';
import { expect } from 'chai';

describe('POST /users/login', () => {
  const endpoint = '/users/login';
  const salt = 'salt';
  const password = '1234qwer@A';

  let requestMaker: RequestMaker<AuthCredentials>;

  before(async () => {
    requestMaker = new RequestMaker();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  it('should login user successfully', async () => {
    const input = await createUser({ salt });
    const user = await dbClient.user.create({ data: input });
    const currentDate = new Date();

    const response = await requestMaker.post({ endpoint, body: { email: input.email, password } });

    const userDb = await  dbClient.user.findUnique({ where: { email: input.email } });
    const sessionDb = await dbClient.session.findFirst({ where: { userId: user.id } });
    const responseData = response.data;

    isDefined(responseData);
    isDefined(userDb);
    isDefined(sessionDb);
    expect(sessionDb.createdAt.toDateString()).to.be.eq(currentDate.toDateString());
    checkLogin(responseData, { ...userDb});
  });

  it('should give an error if email is not found', async () => {
    const body = await createUser({ salt });

    const response = await requestMaker.post({
      endpoint,
      body,
      expectedStatus: 404,
    });

    checkErrors(response, [UserErrors.InvalidEmailOrPassword]);
  });

  it('should give an error if password is not found', async () => {
    const input = await createUser({ salt });
    await dbClient.user.create({ data: input });

    const response = await requestMaker.post({
      endpoint,
      body: { email: input.email, password: 'wrong' },
      expectedStatus: 404,
    });

    checkErrors(response, [UserErrors.InvalidEmailOrPassword]);
  });

  it('should give multiple errors if password and email is not sent', async () => {
    const body = await createUser({ email: '' });
    const response = await requestMaker.post({
      endpoint,
      body: { ...body, password: null },
      expectedStatus: 400,
    });

    checkErrors(response, [
      { code: 'VAL_01', message: 'users.error.invalid-email' },
      { code: 'VAL_01', message: 'users.error.required-password' },
    ]);
  });
});
