import type { JwtPayload, ServerContext, TokenType } from '@domain/model';
import { ContextProvider } from '@repo/core/context';
import { JwtService } from '@repo/core/security';
import type { FastifyRequest } from 'fastify';

export function createContext(req: FastifyRequest): ServerContext {
  const authToken = req.headers.authorization;
  const fowarded = req.headers['x-fowarded-for'] || req.socket.remoteAddress || '';
  const ip = Array.isArray(fowarded) ? fowarded[0] : fowarded.split(',')[0];

  let userId: string | undefined;
  let sessionId: string | undefined;
  let tokenType: TokenType | undefined;

  const guestId = req.headers['x-guest-id'];

  if (authToken) {
    userId = parseAuthToken(authToken)?.userId;
    sessionId = parseAuthToken(authToken)?.sessionId;
    tokenType = parseAuthToken(authToken)?.tokenType;
  } else if (guestId && typeof guestId === 'string') {
    userId = guestId;
  }

  const context: ServerContext = { uuid: crypto.randomUUID(), userId, sessionId, tokenType, ip: ip ?? '' };
  ContextProvider.getInstance<ServerContext>().enterWith(context);

  return context;
}

function parseAuthToken(token: string): JwtPayload | undefined {
  const decodedToken = JwtService.verify<JwtPayload>(token);
  return decodedToken?.data;
}
