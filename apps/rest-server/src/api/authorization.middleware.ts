import { SessionDataSource } from '@data/users/session.datasource';
import { TokenType, type ServerContext } from '@domain/model';
import { ContextProvider } from '@repo/core/context';
import { UnauthorizedError } from '@repo/core/error';

export async function AuthorizationMiddleware(): Promise<void> {
  const { userId, sessionId, tokenType } = ContextProvider.getInstance<ServerContext>().get();

  if (!userId || !sessionId) {
    throw new UnauthorizedError();
  }

  if (tokenType !== TokenType.TOKEN) {
    throw new UnauthorizedError();
  }

  const session = await SessionDataSource.findById(sessionId);
  if (!session || session.userId !== userId) {
    throw new UnauthorizedError();
  }
}
