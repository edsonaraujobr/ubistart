import { SessionDataSource } from '@data/users/session.datasource';
import { DAY_MILLISECONDS } from '@domain/constants';
import { TokenType, type Retoken } from '@domain/model';
import type { UserTokenData } from '@domain/model/users.model';
import { Env } from '@env';
import { CryptoService, JwtService } from '@repo/core/security';

export interface SessionOutput {
  token: string;
  retoken: string;
}

async function exec(userId: string): Promise<SessionOutput> {
  const sessionDurationDays = Number.parseInt(Env.SESSION_DURATION);
  const expirationDate = new Date(Date.now() + sessionDurationDays * DAY_MILLISECONDS);

  let session = await SessionDataSource.findById(userId);

  if (session) {
    await SessionDataSource.update({ id: session.id, expiresIn: expirationDate });
  } else {
    session = await SessionDataSource.create({
      userId,
      expiresIn: expirationDate,
      retoken: null,
    });
  }

  const newRetoken = JwtService.sign<Retoken>({
    payload: { userId: userId, sessionId: session.id, tokenType: TokenType.RETOKEN },
    extendedExpiration: true,
  });

  const hashedRetoken = await CryptoService.generateHashWithSalt(newRetoken, Env.CRYPTO_SALT);

  await SessionDataSource.update({ retoken: hashedRetoken, id: session.id });

  return {
    token: JwtService.sign<UserTokenData>({
      payload: { userId: userId, sessionId: session.id, tokenType: TokenType.TOKEN },
    }),
    retoken: newRetoken,
  };
}

export const CreateSessionUseCase = {
  exec,
};
