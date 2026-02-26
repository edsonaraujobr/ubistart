import { ConflictError } from '@repo/core/error';
import { CryptoService } from '@repo/core/security';
import { CreateSessionUseCase } from './create-session.use-case';
import type { UserInput } from '@domain/model/users.model';
import { UserDatasource } from '@data/users/users.datasource';
import { UserErrors } from './user.errors';
import type { AuthCredentials } from '@domain/model';

async function exec(input: UserInput & { ip: string }): Promise<AuthCredentials> {
  // o ip pode ser utilizado para criar um termos de aceitação em alguns casos... aqui não utilizaremos.

  const { email, password, confirmPassword, name } = input;

  const emailAlreadyExist = await UserDatasource.findByEmailIncludedDeletedUsers(email);

  if (emailAlreadyExist) { // outra possivel feat é recriar a conta pois o user deletou e criou novamente
    throw new ConflictError(UserErrors.AlreadyRegistered);
  }

  if (password !== confirmPassword) {
    throw new ConflictError(UserErrors.PasswordNoMatch);
  }

  const salt = CryptoService.generateRandomPassword();
  const hashedPassword = await CryptoService.generateHashWithSalt(password, salt);

  const newUser = await UserDatasource.createUser({
    email,
    password: hashedPassword,
    salt,
    name
  });

  const session = await CreateSessionUseCase.exec(newUser.id);

  return { 
    user: {
      id: newUser.id,
      email: newUser.email,
      active: newUser.active,
      name: newUser.name,
      typeUser: newUser.typeUser
    },
    ...session
  };
}

export const CreateUserUseCase = { exec };
