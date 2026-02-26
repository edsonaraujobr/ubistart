import { logger } from '@repo/core/log';
import { PrismaClient } from '@repo/db';

export let dbClient: PrismaClient;

export async function configureDatabase() {
  dbClient = new PrismaClient();
  await dbClient.$connect();
  logger.info('Database connected!');
}
