export type FetchwiseErrorOptions = {
  status?: number;
  statusText?: string;
  data?: unknown;
  url?: string;
  method?: string;
  cause?: unknown;
};

export class FetchwiseError extends Error {
  readonly status?: number;
  readonly statusText?: string;
  readonly data?: unknown;
  readonly url?: string;
  readonly method?: string;

  constructor(message: string, options: FetchwiseErrorOptions = {}) {
    super(message, options.cause ? { cause: options.cause } : undefined);
    this.name = "FetchwiseError";
    this.status = options.status;
    this.statusText = options.statusText;
    this.data = options.data;
    this.url = options.url;
    this.method = options.method;
  }
}

export class HTTPError extends FetchwiseError {
  constructor(message: string, options: FetchwiseErrorOptions = {}) {
    super(message, options);
    this.name = "HTTPError";
  }
}

export class TimeoutError extends FetchwiseError {
  constructor(message: string, options: FetchwiseErrorOptions = {}) {
    super(message, options);
    this.name = "TimeoutError";
  }
}

export class ValidationError extends FetchwiseError {
  constructor(message: string, options: FetchwiseErrorOptions = {}) {
    super(message, options);
    this.name = "ValidationError";
  }
}

export function toFetchwiseError(
  error: unknown,
  fallback = "Request failed",
): FetchwiseError {
  if (error instanceof FetchwiseError) return error;
  if (error instanceof Error) {
    return new FetchwiseError(error.message || fallback, { cause: error });
  }
  return new FetchwiseError(fallback, { cause: error });
}
