import { configureRoutes } from '@api/routes.config.js';
import { Env } from '@env/index.js';
import fastifyCompress from '@fastify/compress';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import fastifyRequestContextPlugin from '@fastify/request-context';
import fastifySwagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { logger } from '@repo/core/log';
import Fastify, { type FastifyInstance } from 'fastify';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { createContext } from './context.config.js';
import { parseGlobalError } from './error.global-middleware';

export async function configureRestServer(): Promise<FastifyInstance> {
  const fastify = Fastify();

  
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  await fastify.register(fastifyCompress);
  await fastify.register(cors, {
    origin: '*'
  })
  await fastify.register(helmet);
  await fastify.register(fastifyRequestContextPlugin, { hook: 'preValidation', defaultStoreValues: createContext });
  await configureSwagger(fastify);
  fastify.setErrorHandler(parseGlobalError);

  await configureRoutes(fastify);

  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, async () => {
      await fastify.close();
      process.exit(0);
    });
  });

  try {
    const url = await fastify.listen({ port: Env.PORT, host: '::' });
    logger.info(`Server listening on ${url}`);
    return fastify;
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

async function configureSwagger(fastify: FastifyInstance) {
  if (!Env.ENABLE_SWAGGER) return;
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Template node',
        description: 'A template for REST projects',
        version: '1.0.0',
      },

      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    transform: jsonSchemaTransform,
  });
  await fastify.register(swaggerUi, { routePrefix: '/docs' });
}
