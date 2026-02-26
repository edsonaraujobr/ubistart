import { z } from 'zod';

export const EnvSchema = z.object({
  PORT: z.coerce.number().int().default(3000),
  NPM_CONFIG_PRODUCTION: z.coerce.boolean().default(false),
  LOGGER_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'critical']).default('info'),
  CRYPTO_SALT: z.string(),
  DATABASE_URL: z.string().url(),
  JWT_EXPIRATION: z.string(),
  JWT_SECRET: z.string(),
  SESSION_DURATION: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ENABLE_SWAGGER: z
    .enum(['true', 'false'])
    .default('false')
    .transform(v => v === 'true'),
});

export type EnvSchemaType = z.infer<typeof EnvSchema>;
