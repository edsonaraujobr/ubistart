import { dbClient } from '@data/db.client';
import type { AuthCredentials, ServerContext } from '@domain/model';
import { CryptoService } from '@repo/core/security';
import { expect } from 'chai';
import { isDefined } from '@test/utils/is-defined';
import sinon from 'sinon';
import { clearDatabase } from '@test/db-helper';
import { ContextProvider } from '@repo/core/context';
import { faker } from '@faker-js/faker';
import { checkErrors, checkLogin, checkUser } from '@test/checker.test';
import { RequestMaker } from '@test/request-maker.test';
import { createUser } from '@test/entity-seed.test';
import { UserErrors } from '@domain/users/user.errors';

describe('POST /users', () => {
  const endpoint = '/users/';
  const salt = 'salt';

  let requestMaker: RequestMaker<AuthCredentials>;
  let ip: string;

  before(async () => {
    requestMaker = new RequestMaker();
    ip = faker.internet.ip();

    const context = ContextProvider.getInstance<ServerContext>();

    sinon.stub(CryptoService, 'generateRandomPassword').returns(salt);
    sinon.stub(context, 'get').returns({ ip, uuid: faker.string.uuid() });
  });

  afterEach(async () => {
    await clearDatabase();
  });

  after(() => {
    sinon.restore();
  });

  it('should create user successfully', async () => {
    const body = await createUser({ salt });
    const currentDate = new Date();

    const response = await requestMaker.post({ endpoint, body: { ...body, terms: true, confirmPassword: body.password } });
    const userDb = (await dbClient.user.findUnique({ where: { email: body.email } }))!;
    const sessionDb = await dbClient.session.findFirst({ where: { userId: userDb.id } });
    const responseData = response.data.user;

    isDefined(sessionDb);
    checkUser(responseData, { ...userDb });
    checkLogin(response.data, responseData);
    expect(sessionDb.createdAt.toDateString()).to.be.eq(currentDate.toDateString());
    expect(userDb.email).to.be.eq(body.email);
    expect(responseData.active).to.eq(true);
  });

  it('should give an error if email is already registered', async () => {
    const body = await createUser({});
    await dbClient.user.create({ data: await createUser({ email: body.email, active: true }) });

    const response = await requestMaker.post({
      endpoint,
      body: { ...body, terms: true, confirmPassword: body.password },
      expectedStatus: 409,
    });

    checkErrors(response, [UserErrors.AlreadyRegistered]);
  });

  it('should give an error if email has wrong format', async () => {
    const body = await createUser({ email: '' });
    const response = await requestMaker.post({
      endpoint,
      body: { ...body, terms: true, confirmPassword: body.password },
      expectedStatus: 400,
    });

    checkErrors(response, [{ code: 'VAL_01', message: 'users.error.invalid-email' }]);
  });

  it('should give an error if password does not follow the rules', async () => {
    const body = await createUser({
      password: '213123123',
    });
    const response = await requestMaker.post({
      endpoint,
      body: { ...body, terms: true, confirmPassword: body.password },
      expectedStatus: 400,
    });

    checkErrors(response, [
      { code: 'VAL_01', message: 'users.error.invalid-password' },
      { code: 'VAL_01', message: 'users.error.invalid-password' },
    ]);
  });

  it('should give multiple errors if more than one field does not follow the rule', async () => {
    const body = await createUser({ email: '', password: '' });
    const response = await requestMaker.post({
      endpoint,
      body: { ...body, terms: false, confirmPassword: body.password },
      expectedStatus: 400,
    });

    checkErrors(response, [
      { code: 'VAL_01', message: 'users.error.invalid-email' },
      { code: 'VAL_01', message: 'users.error.invalid-password' },
      { code: 'VAL_01', message: 'users.error.invalid-password' },
    ]);
  });

  it('should give an error if password no match confirm password', async () => {
    const body = await createUser({});

    const response = await requestMaker.post({
      endpoint,
      body: { ...body, terms: true, confirmPassword: '123456@A!' },
      expectedStatus: 409,
    });

    checkErrors(response, [UserErrors.PasswordNoMatch]);
  }); 
});
