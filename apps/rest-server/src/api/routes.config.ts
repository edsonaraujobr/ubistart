import type { ServerContext } from '@domain/model';
import { ContextProvider } from '@repo/core/context';
import { ApplicationLayer, logger } from '@repo/core/log';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { errorsSchema } from './common/common.schema.js';
import { ROUTES_METHODS, type RouteMethodHandler, type Routes, type RoutesHttpMethod } from './routes.js';
import { SettingsRoutes } from './settings/settings.routes.js';
import { UsersRoutes } from './user/users.routes.js';
import { TasksRoutes } from './tasks/tasks.routes.js';

const ROUTES_RESOURCES_TO_REGISTER = [
  SettingsRoutes,
  ...UsersRoutes,
  ...TasksRoutes,
];

export async function configureRoutes(fastify: FastifyInstance) {
  for (const routes of ROUTES_RESOURCES_TO_REGISTER) {
    await fastify.register(registerExistingRoutesMethods(routes), { prefix: routes.base });
  }
}

function registerExistingRoutesMethods(routes: Routes) {
  return async (fastify: FastifyInstance) => {
    ROUTES_METHODS.forEach(method => {
      if (routes[method]) {
        registerRoute(fastify, method, routes[method]);
      }
    });
  };
}

function registerRoute(fastify: FastifyInstance, method: RoutesHttpMethod, route: RouteMethodHandler) {
  const preHandler = route.beforeMiddlewares;
  const schema = { ...route.schema, response: { 500: errorsSchema, ...route.schema.response } };

  if (route.hideRoute) {
    schema.tags = [...(schema.tags || []), 'hidden'];
  }

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method,
    url: route.endpoint,
    schema,
    preHandler,
    attachValidation: route.manualValidation === true,
    handler: async (request, reply) => {
      const uuid = ContextProvider.getInstance<ServerContext>().get().uuid;
      const baseLog = { uuid, layer: ApplicationLayer.Api };
      logger.info({ ...baseLog, message: `${method.toUpperCase()} ${request.url}`, method });

      const response = await route.handler(request);
      const httpStatus = route.onSuccessHttpStatus ?? (method === 'post' ? 201 : 200);

      return reply.code(httpStatus).send(response);
    },
  });
}
