import { NotFoundError } from '@repo/core/error';
import type { Message } from '@domain/model/common.model';
import { Localization } from '@repo/core/localization';
import { SessionDataSource } from '@data/users/session.datasource';
import { UserDatasource } from '@data/users/users.datasource';
import { UserErrors } from './user.errors';
import type { LogoutInput } from '@domain/model/users.model';
import { AuthErrors } from './auth,errors';

async function exec(input: LogoutInput): Promise<Message> {
  const { userId, sessionId } = input;

  const user = await UserDatasource.findById(userId);

  if (!user) {
    throw new NotFoundError(UserErrors.NotFound);
  }

  const session = await SessionDataSource.findById(sessionId);

  if (!session || session?.userId !== userId) {
    throw new NotFoundError(AuthErrors.SessionNotFound);
  }

  await SessionDataSource.deleteSession(session.id);

  return {
    message: Localization.__('users.success.logout'),
  };
}

export const LogoutUseCase = {
  exec,
};
