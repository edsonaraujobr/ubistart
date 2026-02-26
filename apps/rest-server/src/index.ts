import { configureServer } from './server.config.js';
import { configureLogger, logger } from '@repo/core/log';

configureLogger('debug');

configureServer('.env')
  .then(async () => {
    try {
      logger.info('server running');
    } catch (err) {
      logger.error('Error trying to Register data in DB', err);
    }
  })
  .catch(err => {
    logger.error('Erro ao configurar o servidor:', err);
  });
