import { describe, expect, it } from "vitest";
import { HTTPError, TimeoutError, ValidationError } from "../src/errors.js";
import { computeDelay, normalizeRetry, shouldRetry } from "../src/retry.js";

describe("normalizeRetry", () => {
  it("turns a number into retry options", () => {
    expect(normalizeRetry(4)).toMatchObject({ attempts: 4, backoff: "exponential" });
  });

  it("disables retries", () => {
    expect(normalizeRetry()).toBe(false);
    expect(normalizeRetry(false)).toBe(false);
    expect(normalizeRetry(0)).toBe(false);
  });
});

describe("computeDelay", () => {
  it("uses exponential backoff without jitter", () => {
    expect(computeDelay(1, { delay: 100, backoff: "exponential", jitter: false })).toBe(100);
    expect(computeDelay(3, { delay: 100, backoff: "exponential", jitter: false })).toBe(400);
  });

  it("caps the delay", () => {
    expect(
      computeDelay(6, { delay: 1_000, backoff: "exponential", jitter: false, maxDelay: 2_000 }),
    ).toBe(2_000);
  });
});

describe("shouldRetry", () => {
  it("retries timeout and selected HTTP statuses", () => {
    expect(shouldRetry(new TimeoutError("timeout"), { retryOn: [500] })).toBe(true);
    expect(shouldRetry(new HTTPError("server", { status: 503 }), {})).toBe(true);
    expect(shouldRetry(new HTTPError("missing", { status: 404 }), {})).toBe(false);
  });

  it("does not retry validation errors", () => {
    expect(shouldRetry(new ValidationError("bad payload"), {})).toBe(false);
  });
});
