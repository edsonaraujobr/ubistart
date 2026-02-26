import * as dotenv from 'dotenv';
import { existsSync, readFileSync } from 'node:fs';
import * as path from 'node:path';
import type { EnvProvider } from './env.js';

export class DotEnvStrategy implements EnvProvider {
  constructor(private readonly envFile: string) {}

  async load(): Promise<Record<string, unknown>> {
    const fileName = path.join(process.cwd(), this.envFile);
    if (existsSync(fileName)) {
      const file = readFileSync(fileName);
      return dotenv.parse(file);
    }

    return {};
  }
}
