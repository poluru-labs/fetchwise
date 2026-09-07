export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export type RetryBackoff = "fixed" | "linear" | "exponential";

export interface RetryOptions {
  /** Total tries, including the first request. Default: 3 */
  attempts?: number;
  /** Base delay in milliseconds. Default: 300 */
  delay?: number;
  /** Delay strategy. Default: "exponential" */
  backoff?: RetryBackoff;
  /** Cap for computed delay. Default: 30_000 */
  maxDelay?: number;
  /** Randomize delay slightly to avoid thundering herds. Default: true */
  jitter?: boolean;
  /** HTTP statuses that should retry, or a custom predicate */
  retryOn?: number[] | ((status: number, error: unknown) => boolean);
}

export interface Schema<T> {
  parse(data: unknown): T;
}

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | QueryValue[]>;
export type PathParams = Record<string, string | number | boolean>;

export interface ClientOptions {
  baseURL?: string;
  headers?: HeadersInit;
  timeout?: number;
  retry?: number | RetryOptions | false;
  fetch?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

export interface RequestConfig<T = unknown> {
  method?: HttpMethod;
  headers?: HeadersInit;
  query?: QueryParams;
  params?: PathParams;
  body?: unknown;
  timeout?: number;
  retry?: number | RetryOptions | false;
  schema?: Schema<T>;
  signal?: AbortSignal;
  parseAs?: "json" | "text" | "blob" | "auto" | "raw";
  fetchOptions?: Omit<RequestInit, "method" | "headers" | "body" | "signal">;
}

export interface RequestContext {
  url: string;
  method: HttpMethod;
  headers: Headers;
  body?: BodyInit | null;
  timeout?: number;
  retry?: RetryOptions | false;
  signal?: AbortSignal;
  parseAs?: RequestConfig["parseAs"];
  schema?: Schema<unknown>;
  fetchOptions?: RequestConfig["fetchOptions"];
}

export interface ResponseContext<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  url: string;
  raw: Response;
}

/**
 * Map HTTP routes to request/response types.
 *
 * @example
 * interface API {
 *   'GET /users': User[];
 *   'POST /users': { body: CreateUser; response: User };
 * }
 */
export type ApiSchema = object;

type ExtractPath<T, M extends HttpMethod> = {
  [K in keyof T]: K extends `${M} ${infer P}` ? P : never;
}[keyof T];

export type PathOf<TApi extends ApiSchema, M extends HttpMethod> =
  ExtractPath<TApi, M> extends never ? string : ExtractPath<TApi, M> & string;

type RouteKey<M extends HttpMethod, P extends string> = `${M} ${P}`;

export type RouteDef<
  TApi extends ApiSchema,
  M extends HttpMethod,
  P extends string,
> = RouteKey<M, P> extends keyof TApi ? TApi[RouteKey<M, P>] : unknown;

export type InferRouteResponse<D> = D extends { response: infer R }
  ? R
  : D extends { body: unknown }
    ? unknown
    : D extends { query: unknown }
      ? unknown
      : D extends { params: unknown }
        ? unknown
        : D;

export type InferRouteBody<D> = D extends { body: infer B } ? B : unknown;

export type InferRouteQuery<D> = D extends { query: infer Q } ? Q : QueryParams;

export type InferRouteParams<D> = D extends { params: infer P } ? P : PathParams;

export type MethodConfig<
  TApi extends ApiSchema,
  M extends HttpMethod,
  P extends string,
  T = InferRouteResponse<RouteDef<TApi, M, P>>,
> = Omit<RequestConfig<T>, "method" | "body"> & {
  query?: InferRouteQuery<RouteDef<TApi, M, P>> & QueryParams;
  params?: InferRouteParams<RouteDef<TApi, M, P>> & PathParams;
};
