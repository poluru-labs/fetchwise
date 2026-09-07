import {
  FetchwiseError,
  HTTPError,
  TimeoutError,
  ValidationError,
  isAbortError,
  toFetchwiseError,
} from "./errors.js";
import { InterceptorManager } from "./interceptors.js";
import {
  computeDelay,
  normalizeRetry,
  shouldRetry,
  sleep,
} from "./retry.js";
import type {
  ApiSchema,
  ClientOptions,
  HttpMethod,
  InferRouteBody,
  InferRouteResponse,
  MethodConfig,
  PathOf,
  RequestConfig,
  RequestContext,
  ResponseContext,
  RouteDef,
} from "./types.js";
import { mergeBaseURL, resolveBaseURL, resolveURL } from "./url.js";

function mergeHeaders(...groups: Array<HeadersInit | undefined>): Headers {
  const headers = new Headers();

  for (const group of groups) {
    if (!group) continue;
    new Headers(group).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
}

function serializeBody(
  body: unknown,
  headers: Headers,
): BodyInit | null | undefined {
  if (body == null) return undefined;
  if (
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body)
  ) {
    return body as BodyInit;
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return JSON.stringify(body);
}

async function parseBody(
  response: Response,
  parseAs: RequestConfig["parseAs"] = "auto",
): Promise<unknown> {
  if (parseAs === "raw") return response;
  if (parseAs === "blob") return response.blob();
  if (parseAs === "text") return response.text();
  if (parseAs === "json") {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();
  if (!text) return null;
  if (contentType.includes("application/json") || contentType.includes("+json")) {
    return JSON.parse(text);
  }
  return text;
}

export class Fetchwise<TApi extends ApiSchema = ApiSchema> {
  readonly interceptors = {
    request: new InterceptorManager<RequestContext>(),
    response: new InterceptorManager<ResponseContext>(),
    error: new InterceptorManager<FetchwiseError>(),
  };

  constructor(private readonly options: ClientOptions = {}) {}

  extend(options: ClientOptions): Fetchwise<TApi> {
    const next = new Fetchwise<TApi>({
      ...this.options,
      ...options,
      baseURL: mergeBaseURL(this.options.baseURL, options.baseURL),
      headers: mergeHeaders(this.options.headers, options.headers),
      retry: options.retry !== undefined ? options.retry : this.options.retry,
    });

    return next;
  }

  get<P extends PathOf<TApi, "GET">>(
    url: P,
    config?: MethodConfig<TApi, "GET", P>,
  ): Promise<InferRouteResponse<RouteDef<TApi, "GET", P>>>;
  get<T>(url: string, config?: RequestConfig<T>): Promise<T>;
  get(url: string, config?: RequestConfig): Promise<unknown> {
    return this.request(url, { ...config, method: "GET" });
  }

  delete<P extends PathOf<TApi, "DELETE">>(
    url: P,
    config?: MethodConfig<TApi, "DELETE", P>,
  ): Promise<InferRouteResponse<RouteDef<TApi, "DELETE", P>>>;
  delete<T>(url: string, config?: RequestConfig<T>): Promise<T>;
  delete(url: string, config?: RequestConfig): Promise<unknown> {
    return this.request(url, { ...config, method: "DELETE" });
  }

  head<P extends PathOf<TApi, "HEAD">>(
    url: P,
    config?: MethodConfig<TApi, "HEAD", P>,
  ): Promise<InferRouteResponse<RouteDef<TApi, "HEAD", P>>>;
  head<T>(url: string, config?: RequestConfig<T>): Promise<T>;
  head(url: string, config?: RequestConfig): Promise<unknown> {
    return this.request(url, { ...config, method: "HEAD" });
  }

  post<P extends PathOf<TApi, "POST">>(
    url: P,
    body?: InferRouteBody<RouteDef<TApi, "POST", P>>,
    config?: MethodConfig<TApi, "POST", P>,
  ): Promise<InferRouteResponse<RouteDef<TApi, "POST", P>>>;
  post<T>(url: string, body?: unknown, config?: RequestConfig<T>): Promise<T>;
  post(url: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    return this.request(url, { ...config, method: "POST", body });
  }

  put<P extends PathOf<TApi, "PUT">>(
    url: P,
    body?: InferRouteBody<RouteDef<TApi, "PUT", P>>,
    config?: MethodConfig<TApi, "PUT", P>,
  ): Promise<InferRouteResponse<RouteDef<TApi, "PUT", P>>>;
  put<T>(url: string, body?: unknown, config?: RequestConfig<T>): Promise<T>;
  put(url: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    return this.request(url, { ...config, method: "PUT", body });
  }

  patch<P extends PathOf<TApi, "PATCH">>(
    url: P,
    body?: InferRouteBody<RouteDef<TApi, "PATCH", P>>,
    config?: MethodConfig<TApi, "PATCH", P>,
  ): Promise<InferRouteResponse<RouteDef<TApi, "PATCH", P>>>;
  patch<T>(url: string, body?: unknown, config?: RequestConfig<T>): Promise<T>;
  patch(url: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    return this.request(url, { ...config, method: "PATCH", body });
  }

  async request<T = unknown>(url: string, config: RequestConfig<T> = {}): Promise<T> {
    const response = await this.send<T>(url, config);
    return response.data;
  }

  async send<T = unknown>(
    url: string,
    config: RequestConfig<T> = {},
  ): Promise<ResponseContext<T>> {
    try {
      resolveBaseURL(this.options.baseURL, config.baseURL);
    } catch (error) {
      throw await this.runErrorInterceptors(error);
    }

    const retry = normalizeRetry(
      config.retry !== undefined ? config.retry : this.options.retry,
    );
    const attempts = retry ? (retry.attempts ?? 3) : 1;

    let lastError: unknown;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        return await this.dispatch<T>(url, config);
      } catch (error) {
        lastError = error;
        const canRetry =
          retry && attempt < attempts && shouldRetry(error, retry);

        if (!canRetry) break;
        await sleep(computeDelay(attempt, retry));
      }
    }

    throw await this.runErrorInterceptors(lastError);
  }

  private async dispatch<T>(
    url: string,
    config: RequestConfig<T>,
  ): Promise<ResponseContext<T>> {
    const headers = mergeHeaders(this.options.headers, config.headers);
    const body = serializeBody(config.body, headers);
    const resolvedURL = resolveURL(
      resolveBaseURL(this.options.baseURL, config.baseURL),
      url,
      config.params,
      config.query,
    );

    let request: RequestContext = {
      url: resolvedURL,
      method: config.method ?? "GET",
      headers,
      body,
      timeout: config.timeout ?? this.options.timeout,
      signal: config.signal,
      parseAs: config.parseAs,
      schema: config.schema,
      fetchOptions: config.fetchOptions,
    };

    request = await this.interceptors.request.run(request);

    const response = await this.performFetch(request);
    let data = await parseBody(response, request.parseAs);

    if (!response.ok) {
      throw new HTTPError(
        `${request.method} ${request.url} failed with ${response.status} ${response.statusText}`,
        {
          status: response.status,
          statusText: response.statusText,
          data,
          url: request.url,
          method: request.method,
        },
      );
    }

    if (request.schema) {
      try {
        data = request.schema.parse(data);
      } catch (cause) {
        throw new ValidationError("Response validation failed", {
          cause,
          data,
          status: response.status,
          url: request.url,
          method: request.method,
        });
      }
    }

    const context: ResponseContext<T> = {
      data: data as T,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      url: response.url || request.url,
      raw: response,
    };

    return (await this.interceptors.response.run(context)) as ResponseContext<T>;
  }

  private async performFetch(request: RequestContext): Promise<Response> {
    const fetchFn = this.options.fetch ?? globalThis.fetch;
    if (!fetchFn) {
      throw new FetchwiseError("No fetch implementation found");
    }

    const controller = new AbortController();
    let timedOut = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const onAbort = () => controller.abort(request.signal?.reason);
    if (request.signal) {
      if (request.signal.aborted) controller.abort(request.signal.reason);
      else request.signal.addEventListener("abort", onAbort);
    }

    try {
      const fetchPromise = fetchFn(request.url, {
        credentials: this.options.credentials,
        ...request.fetchOptions,
        method: request.method,
        headers: request.headers,
        body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
        signal: controller.signal,
      });

      if (!request.timeout || request.timeout <= 0) {
        return await fetchPromise;
      }

      const timeoutPromise = new Promise<Response>((_, reject) => {
        timer = setTimeout(() => {
          timedOut = true;
          controller.abort();
          reject(
            new TimeoutError(`Request timed out after ${request.timeout}ms`, {
              url: request.url,
              method: request.method,
            }),
          );
        }, request.timeout);
      });

      return await Promise.race([fetchPromise, timeoutPromise]);
    } catch (error) {
      if (timedOut || error instanceof TimeoutError) {
        throw error instanceof TimeoutError
          ? error
          : new TimeoutError(`Request timed out after ${request.timeout}ms`, {
              url: request.url,
              method: request.method,
              cause: error,
            });
      }

      if (isAbortError(error)) {
        throw new FetchwiseError("Request was aborted", {
          url: request.url,
          method: request.method,
          cause: error,
        });
      }

      throw toFetchwiseError(error, "Network request failed");
    } finally {
      if (timer) clearTimeout(timer);
      request.signal?.removeEventListener("abort", onAbort);
    }
  }

  private async runErrorInterceptors(error: unknown): Promise<FetchwiseError> {
    const current = await this.interceptors.error.run(toFetchwiseError(error));
    return current;
  }
}

export function createClient<TApi extends ApiSchema = ApiSchema>(
  options?: ClientOptions,
): Fetchwise<TApi> {
  return new Fetchwise<TApi>(options);
}

export { createClient as fetchwise };
