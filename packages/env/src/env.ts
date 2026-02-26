import type { ZodObject, ZodTypeAny } from 'zod';

export interface EnvProvider {
  load(): Promise<Record<string, unknown>>;
}

interface SetupOptions {
  schema: ZodObject<Record<string, ZodTypeAny>>;
  providers: EnvProvider[];
}

export class EnvConfig {
  private static cache: EnvConfig | null = null;
  private envs: Record<string, string> = {};
  private constructor() {}

  static get instance(): EnvConfig {
    if (!EnvConfig.cache) {
      EnvConfig.cache = new EnvConfig();
    }

    return EnvConfig.cache;
  }

  async setup(options: SetupOptions) {
    const rawConfig: Record<string, unknown> = process.env;
    for (const provider of options.providers) {
      const config = await provider.load();
      Object.assign(rawConfig, config);
    }

    try {
      this.envs = options.schema.parse(rawConfig);
    } catch (error) {
      throw new Error(`Env config validation error: ${error.message}`);
    }
  }

  getEnvs<T>(): T {
    return this.envs as T;
  }
}
