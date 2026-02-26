import type { ErrorFields } from '@repo/core/error';
import { Localization } from '@repo/core/localization';
import { expect } from 'chai';
import type { UserModel, UserTokenData } from '@domain/model/users.model.js';
import { JwtService } from '@repo/core/security';
import { isDefined } from './utils/is-defined.js';
import { use } from 'chai';
import chaiExclude from 'chai-exclude';
import type { AuthCredentials } from '@domain/model/auth.model.js';
import type { HttpResponse } from './request-maker.test.js';

use(chaiExclude);

export function checkErrors<T>(response: HttpResponse<T>, expectedErrors: ErrorFields[]) {
  expect(response.data.errors).to.have.lengthOf(expectedErrors.length);

  response.data.errors.forEach((error, index) => {
    const { uuid, details, ...errorFields } = error;
    const expectedError = expectedErrors[index];

    expect(errorFields).to.be.deep.eq({ code: expectedError!.code, message: Localization.__(expectedError!.message!) });
  });
}

export function checkUser(response: UserModel, user: UserModel) {
  expect(response).to.be.deep.eq({
    id: user.id,
    email: user.email,
    active: user.active,
    name: user.name,
    typeUser: user.typeUser,
  });
}

export function checkLogin(response: AuthCredentials, user: UserModel) {
  const decodedToken = JwtService.verify<UserTokenData>(response.token);
  const decodedRetoken = JwtService.verify<UserTokenData>(response.retoken);

  isDefined(decodedToken);
  isDefined(decodedRetoken);
  expect(decodedToken.data.userId).to.be.deep.eq(user.id);
  expect(decodedRetoken.data.userId).to.be.deep.eq(user.id);
  expect(decodedToken.iat).to.be.approximately(Date.now() / 1000, 1000 * 60);
  expect(decodedRetoken.iat).to.be.approximately(Date.now() / 1000, 1000 * 60);
  expect(decodedRetoken.exp).to.be.gt(decodedToken.exp);
  expect(decodedToken.exp).to.be.gt(decodedToken.iat);
  expect(decodedRetoken.exp).to.be.gt(decodedRetoken.iat);
  checkUser(response.user, user);
}
