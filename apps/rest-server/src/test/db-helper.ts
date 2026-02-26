import { dbClient } from '@data/db.client';

export async function clearDatabase(): Promise<void> {
  const tables: any[] = await dbClient.$queryRawUnsafe(`
    SELECT TABLE_NAME
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND TABLE_NAME != '_prisma_migrations'
  `);

  await dbClient.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

  for (const table of tables) {
    const tableName = table.TABLE_NAME;

    if (!tableName) continue;

    await dbClient.$executeRawUnsafe(
      `DELETE FROM \`${tableName}\`;`
    );

    await dbClient.$executeRawUnsafe(
      `ALTER TABLE \`${tableName}\` AUTO_INCREMENT = 1;`
    );
  }

  await dbClient.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
}
