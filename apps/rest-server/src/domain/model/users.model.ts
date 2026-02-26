import type { TypeUser } from "@repo/db";
import type { TokenType } from "./auth.model";

export interface UserModel {
  id: string;
  email: string;
  active: boolean;
  name: string;
  typeUser: TypeUser;
}

export interface UserInput extends Omit<UserModel, 'id' | 'active' | 'typeUser'> {
  password: string;
  confirmPassword: string;
}

export interface CreateUserInput extends Omit<UserInput, 'confirmPassword'> {}

export interface UserTokenData {
  userId: string;
  sessionId: string;
  tokenType: TokenType;
}

export interface SessionModel {
  id: string;
  userId: string;
  retoken?: string | null;
  expiresIn: Date;
}

export type UserWithCredentialsModel = UserModel & {
  password: string;
  salt: string;
};

export interface UserLoginInput {
  email: string;
  password: string;
}
