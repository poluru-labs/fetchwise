import type { Fetchwise } from "./client.js";
import type {
  HttpMethod,
  PathParams,
  QueryParams,
  RequestConfig,
  Schema,
} from "./types.js";

export interface RouteConfig<TResponse = unknown> {
  method: HttpMethod;
  path: string;
  schema?: Schema<TResponse>;
  headers?: HeadersInit;
}

export interface RouteInput {
  params?: PathParams;
  query?: QueryParams;
  body?: unknown;
  headers?: HeadersInit;
  timeout?: number;
  retry?: RequestConfig["retry"];
  signal?: AbortSignal;
}

export type DefinedApi<TRoutes extends Record<string, RouteConfig<any>>> = {
  [K in keyof TRoutes]: TRoutes[K] extends RouteConfig<infer TResponse>
    ? (input?: RouteInput) => Promise<TResponse>
    : never;
};

/**
 * Turn a route map into named, typed API methods.
 *
 * @example
 * const api = defineApi({
 *   client,
 *   routes: {
 *     getUser: { method: 'GET', path: '/users/:id', schema: UserSchema },
 *   },
 * });
 *
 * const user = await api.getUser({ params: { id: 1 } });
 */
export function defineApi<TRoutes extends Record<string, RouteConfig<any>>>(options: {
  client: Fetchwise<any>;
  routes: TRoutes;
}): DefinedApi<TRoutes> {
  const api = {} as DefinedApi<TRoutes>;

  for (const [name, route] of Object.entries(options.routes)) {
    (api as Record<string, (input?: RouteInput) => Promise<unknown>>)[name] = (
      input: RouteInput = {},
    ) =>
      options.client.request(route.path, {
        method: route.method,
        params: input.params,
        query: input.query,
        body: input.body,
        headers: { ...route.headers, ...input.headers },
        schema: route.schema,
        timeout: input.timeout,
        retry: input.retry,
        signal: input.signal,
      });
  }

  return api;
}
