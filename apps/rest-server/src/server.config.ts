import { configureRestServer } from '@api/rest.config.js';
import { configureDatabase } from '@data/db.client.js';
import { Env, configureEnv } from '@env/index.js';
import { Localization } from '@repo/core/localization';
import { configureLogger } from '@repo/core/log';

import { CryptoService, JwtService } from '@repo/core/security';
import type { FastifyInstance } from 'fastify';
import { join } from 'node:path';

export async function configureServer(envFile: string): Promise<FastifyInstance> {
  await configureEnv(envFile);
  await configureLogger(Env.LOGGER_LEVEL);

  CryptoService.configure(Env.CRYPTO_SALT);
  JwtService.configure({
    expiration: Env.JWT_EXPIRATION,
    secret: Env.JWT_SECRET,
    sessionExpiration: Env.SESSION_DURATION,
  });
  Localization.configure(join(import.meta.dirname, 'domain', 'locale'), ['pt_BR'], 'pt_BR');

  await configureDatabase();
  return configureRestServer();
}
