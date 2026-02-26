import { type LogType, Logger, ApplicationLayer } from './logger.js';

export * from './logger.js';

let logger: Logger;

function configureLogger(level: LogType): void {
  logger = new Logger(level);
}

export { logger, configureLogger, ApplicationLayer };
