import type { FastifyRequest } from 'fastify';
import type { ZodArray, ZodObject, ZodString } from 'zod';

export const ROUTES_METHODS = ['post', 'get', 'put', 'delete', 'patch'] as const;
export type RoutesHttpMethod = (typeof ROUTES_METHODS)[number];
type RouteHandlers = { [method in RoutesHttpMethod]?: RouteMethodHandler };
type Middleware = (request: FastifyRequest) => Promise<void>;

interface RequestFields {
  body: any;
  params: any;
  headers: any;
  query: any;
}

/**
 * Schema containing the types of the request and response bodies. Useful for runtine validation and OpenAPI docs.
 */
export interface RoutesSchema {
  body?: ZodObject<any>;
  params?: ZodObject<any>;
  querystring?: ZodObject<any>;
  /** Key is the HTTP status code, value is the response body type */
  response?: Record<number, ZodObject<any> | ZodString | ZodArray<any>>;
  headers?: ZodObject<any>;
  tags?: string[];
  description?: string;
  summary?: string;
}

/**
 * Object to define the details about an endpoint to be registered
 */
export interface RouteMethodHandler {
  /** Endpoint inside the base route. Leave as '' if it's the same as the base route */
  endpoint: string;
  /** {@link RoutesSchema} */
  schema: RoutesSchema;
  /** Functions that will be run before the requests, on the specified order. */
  beforeMiddlewares?: Middleware[];
  /** Http status to return when request has succeeded. Defaults to 201 on POST method and 200 on the other ones */
  onSuccessHttpStatus?: number;
  /** Function that receives the request body. Return here the response body */
  handler: (input: RequestFields) => Promise<any>;
  manualValidation?: boolean;
  hideRoute?: boolean;
}

/**
 * Object to list all routes for a REST resource to be registered
 * @fields Possible keys {@link HttpMethod}: values of type {@link RouteMethodHandler}
 */
export interface Routes extends RouteHandlers {
  /** Endpoint inside the base route. Leave as '' if it's the same as the base route */
  base: string;
}
