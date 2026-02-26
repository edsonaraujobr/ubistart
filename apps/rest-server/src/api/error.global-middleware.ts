import type { ServerContext } from '@domain/model';
import { ContextProvider } from '@repo/core/context';
import { GlobalErrors, isBaseError } from '@repo/core/error';
import { Localization } from '@repo/core/localization';
import { logger } from '@repo/core/log';
import type { FastifyReply } from 'fastify';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';

export interface ErrorBody {
  code: string;
  message: string;
  uuid?: string;
  details?: any;
}

export function parseGlobalError(error: any, _, reply: FastifyReply) {
  logger.error(error);

  const uuid = ContextProvider.getInstance<ServerContext>().get().uuid;
  const errors: ErrorBody[] = [];
  let status = 500;

  if (isBaseError(error)) {
    status = error.status;
    errors.push({
      code: error.code,
      message: Localization.__(error.message),
      uuid,
      details: error.details,
    });
  } else if (hasZodFastifySchemaValidationErrors(error)) {
    status = 400;
    errors.push(
      ...error.validation.map(validation => ({
        code: 'VAL_01',
        message: Localization.__(validation.message),
        uuid,
        details: validation.params?.issue ?? validation.message,
      })),
    );
  } else {
    errors.push({
      code: GlobalErrors.Generic.code,
      message: Localization.__(GlobalErrors.Generic.message),
      uuid,
      details: error.message,
    });
  }

  reply.status(status).send({ errors });
}
