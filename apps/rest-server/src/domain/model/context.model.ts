import type { TokenType } from './auth.model';

export interface ServerContext {
  uuid: string;
  userId?: string;
  sessionId?: string;
  tokenType?: TokenType;
  ip: string;
}
