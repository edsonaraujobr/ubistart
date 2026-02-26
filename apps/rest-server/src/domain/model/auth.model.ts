import type { UserModel } from "./users.model";

export interface AuthInput {
  email: string;
  password: string;
}

export enum TokenType {
  TOKEN = 'TOKEN',
  RETOKEN = 'RETOKEN',
}

export interface Retoken {
  userId: string;
  sessionId: string;
  tokenType: TokenType;
}

export interface JwtPayload {
  userId: string;
  sessionId: string;
  tokenType: TokenType;
}

export interface AuthCredentials {
  token: string;
  retoken: string;
  user: UserModel;
}
