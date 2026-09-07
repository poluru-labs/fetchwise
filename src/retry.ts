import { HTTPError, TimeoutError, ValidationError, isAbortError } from "./errors.js";
import type { RetryOptions } from "./types.js";

export const DEFAULT_RETRY_STATUSES = [408, 429, 500, 502, 503, 504];

export function normalizeRetry(
  retry?: number | RetryOptions | false,
): RetryOptions | false {
  if (retry == null || retry === false || retry === 0) return false;
  if (typeof retry === "number") {
    return {
      attempts: retry,
      delay: 300,
      backoff: "exponential",
      maxDelay: 30_000,
      jitter: true,
      retryOn: DEFAULT_RETRY_STATUSES,
    };
  }

  return {
    attempts: 3,
    delay: 300,
    backoff: "exponential",
    maxDelay: 30_000,
    jitter: true,
    retryOn: DEFAULT_RETRY_STATUSES,
    ...retry,
  };
}

export function computeDelay(attempt: number, options: RetryOptions): number {
  const base = options.delay ?? 300;
  let delay = base;

  if (options.backoff === "linear") delay = base * attempt;
  if (options.backoff === "exponential") delay = base * 2 ** (attempt - 1);
  if (options.maxDelay) delay = Math.min(delay, options.maxDelay);
  if (options.jitter) delay = Math.round(delay * (0.5 + Math.random() * 0.5));

  return delay;
}

export function shouldRetry(error: unknown, options: RetryOptions): boolean {
  if (error instanceof ValidationError) return false;

  const status = error instanceof HTTPError ? error.status : 0;

  if (typeof options.retryOn === "function") {
    return options.retryOn(status ?? 0, error);
  }

  if (error instanceof HTTPError) {
    const codes = options.retryOn ?? DEFAULT_RETRY_STATUSES;
    return codes.includes(error.status ?? -1);
  }

  if (error instanceof TimeoutError) return true;
  if (isAbortError(error)) return false;

  return true;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
