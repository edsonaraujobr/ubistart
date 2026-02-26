import { CryptoService } from '@repo/core/security';
import { faker } from '@faker-js/faker';
import type { UserWithCredentialsModel } from '@domain/model/users.model';
import { TypeUser } from '@repo/db';

export async function createUser(options: Partial<UserWithCredentialsModel> = {}): Promise<UserWithCredentialsModel> {
  const { password, salt, ...cleanOptions } = options;
  const customSalt = salt ?? CryptoService.generateRandomPassword();
  const customPassword = await CryptoService.generateHashWithSalt('1234qwer@A', customSalt);

  const defaulUser: Partial<UserWithCredentialsModel> = {
    email: faker.internet.email(),
    salt: customSalt,
    active: false,
    password: password ?? customPassword,
    name: faker.person.fullName(),
    typeUser: TypeUser.USER,
  };

  return Object.assign(defaulUser, cleanOptions) as UserWithCredentialsModel;
}
