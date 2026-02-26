import { UserDatasource } from '@data/users/users.datasource';
import { InvalidDataError, NotFoundError } from '@repo/core/error';
import { UserErrors } from './user.errors';
import type { UserModel } from '@domain/model/users.model';

async function exec(userId: string): Promise<UserModel> {
  const user = await UserDatasource.findById(userId);

  if (!user) {
    throw new NotFoundError(UserErrors.NotFound);
  }

  if (!user.active) {
    throw new InvalidDataError(UserErrors.UserNotActive);
  }

  return user;
}

export const CheckUserUseCase = {
  exec,
};
