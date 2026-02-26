import { dbClient } from "@data/db.client";
import type { CreateUserInput, UserModel, UserWithCredentialsModel } from "@domain/model/users.model";
import { TypeUser } from "@repo/db";

async function findByEmail(email: string): Promise<UserWithCredentialsModel | null> {
  const user = await dbClient.user.findUnique({
    where: { email, deletedAt: null }
  })

  return user ?? null;
}

async function findByEmailIncludedDeletedUsers(email: string): Promise<UserWithCredentialsModel | null> {
  const user = await dbClient.user.findUnique({
    where: { email }
  })

  return user ?? null;
}

async function createUser(input: CreateUserInput & { salt: string }): Promise<UserModel> {
  const { ...userData } = input;

  const user = await dbClient.user.create({
    data: { ...userData, typeUser: TypeUser.USER, active: true }
  })

  return user;
}

async function findById(id: string): Promise<UserWithCredentialsModel | null> {
  const user = await dbClient.user.findUnique({
    where: { id, deletedAt: null }
  })

  return user ?? null;
}

export const UserDatasource = {
  findByEmail,
  createUser,
  findByEmailIncludedDeletedUsers,
  findById
}
