import { NotFoundError } from '@repo/core/error';
import { CryptoService } from '@repo/core/security';
import type { AuthCredentials } from '@domain/model';
import { CreateSessionUseCase } from './create-session.use-case';
import { UserErrors } from './user.errors';
import { UserDatasource } from '@data/users/users.datasource';

async function exec(input: { email: string; password: string }): Promise<AuthCredentials> {
  const { email, password } = input;

  const userExists = await UserDatasource.findByEmail(email);

  const validUser =
  userExists &&
    (await CryptoService.generateHashWithSalt(password, userExists.salt)) === userExists.password;

  if (!validUser) {
    throw new NotFoundError(UserErrors.InvalidEmailOrPassword);
  }

  const session = await CreateSessionUseCase.exec(userExists.id);

  return {
    ...session,
    user: userExists,
  };
}

export const LoginUseCase = {
  exec,
};
