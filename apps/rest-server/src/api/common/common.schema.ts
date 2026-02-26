import { z } from 'zod';

const pageInfoSchema = z.object({
  offset: z.number().optional(),
  limit: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export const errorSchema = z.object({
  code: z.string(),
  message: z.string(),
  uuid: z.string().optional(),
  details: z.any().optional(),
});

export const paginatedSchema = z.object({
  count: z.number(),
  pageInfo: pageInfoSchema,
});

export const messageSchema = z.object({
  message: z.string(),
});

export const codeSchema = z.object({
  message: z.string(),
  coolDown: z.date().nullable(),
});

export const errorsSchema = z.object({
  errors: z.array(errorSchema),
});

export const emptyBodySchema = z.string().length(0);

export const filterInputSchema = z.object({
  offset: z.coerce.number().optional(),
  limit: z.coerce.number(),
});
