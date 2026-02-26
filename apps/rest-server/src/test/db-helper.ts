import { dbClient } from '@data/db.client';

let cachedTableNames: string[] = [];

const allTables = async (): Promise<void> => {
  if (!cachedTableNames.length) {
    const data = await dbClient.$queryRaw<
      { table_name: string }[]
    >`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `;

    cachedTableNames = data
      .map((row) => row.table_name)
      .filter(
        (name) =>
          name &&
          name !== '_prisma_migrations'
      );
  }
};

export async function clearDatabase(): Promise<void> {
  if (!cachedTableNames.length) {
    await allTables();
  }

  await dbClient.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

  for (const table of cachedTableNames) {
    await dbClient.$executeRawUnsafe(
      `TRUNCATE TABLE \`${table}\`;`
    );
  }

  await dbClient.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
}
