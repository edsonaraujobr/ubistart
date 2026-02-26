import { DotEnvStrategy, EnvConfig } from '@repo/env';
import { EnvSchema, type EnvSchemaType } from './env-schema.js';

export let Env: EnvSchemaType;

export async function configureEnv(envFile: string) {
  await EnvConfig.instance.setup({ schema: EnvSchema, providers: [new DotEnvStrategy(envFile)] });
  Env = EnvConfig.instance.getEnvs<EnvSchemaType>();
}
