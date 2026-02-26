import { dbClient } from '@data/db.client';
import type { SessionModel } from '@domain/model/users.model';

interface SessionParams {
  userId: string;
  retoken?: string | null;
  expiresIn: Date;
}

function create(input: SessionParams): Promise<SessionModel> {
  const { userId, retoken, expiresIn } = input;
  return dbClient.session.create({ data: { userId, retoken, expiresIn } });
}

function findById(id: string): Promise<SessionModel | null> {
  return dbClient.session.findUnique({ where: { id } });
}

function update(input: { retoken?: string; id: string; expiresIn?: Date }): Promise<SessionModel> {
  const { retoken, id, expiresIn } = input;
  return dbClient.session.update({ where: { id }, data: { retoken, expiresIn } });
}


async function deleteSession(id: string): Promise<void> {
  await dbClient.session.delete({ where: { id } });
}

export const SessionDataSource = {
  create,
  deleteSession,
  findById,
  update,
};
