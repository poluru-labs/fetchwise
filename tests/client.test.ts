import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { createClient } from "../src/client.js";
import { HTTPError, TimeoutError, ValidationError } from "../src/errors.js";

type FetchMock = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

function jsonResponse(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

describe("createClient", () => {
  it("performs a typed JSON GET", async () => {
    const fetchMock = vi.fn<FetchMock>(async () => jsonResponse({ id: 1, name: "Ada" }));
    const api = createClient({
      baseURL: "https://api.example.com",
      fetch: fetchMock,
    });

    const user = await api.get<{ id: number; name: string }>("/users/1");

    expect(user).toEqual({ id: 1, name: "Ada" });
    expectTypeOf(user).toEqualTypeOf<{ id: number; name: string }>();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe("https://api.example.com/users/1");
  });

  it("serializes JSON bodies and path params", async () => {
    const fetchMock = vi.fn<FetchMock>(async (_url, init) => {
      expect(init?.method).toBe("POST");
      expect(init?.body).toBe(JSON.stringify({ name: "Ada" }));
      return jsonResponse({ id: 2, name: "Ada" }, { status: 201 });
    });

    const api = createClient({ fetch: fetchMock });
    const created = await api.post("/users/:id", { name: "Ada" }, { params: { id: 2 } });

    expect(created).toEqual({ id: 2, name: "Ada" });
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe("/users/2");
  });

  it("retries failed HTTP statuses", async () => {
    const fetchMock = vi
      .fn<FetchMock>()
      .mockResolvedValueOnce(jsonResponse({ error: "nope" }, { status: 503 }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    const api = createClient({
      fetch: fetchMock,
      retry: { attempts: 2, delay: 1, jitter: false },
    });

    await expect(api.get("/flaky")).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws HTTPError for non-retryable failures", async () => {
    const api = createClient({
      fetch: (async () => jsonResponse({ message: "missing" }, { status: 404 })) satisfies FetchMock,
      retry: false,
    });

    await expect(api.get("/missing")).rejects.toBeInstanceOf(HTTPError);
  });

  it("validates responses with a schema", async () => {
    const api = createClient({
      fetch: (async () => jsonResponse({ id: "bad" })) satisfies FetchMock,
      retry: false,
    });

    await expect(
      api.get("/users/1", {
        schema: {
          parse(data: unknown) {
            const value = data as { id?: unknown };
            if (typeof value.id !== "number") throw new Error("id must be a number");
            return value;
          },
        },
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("runs request and response interceptors", async () => {
    const fetchMock = vi.fn<FetchMock>(async () => jsonResponse({ ok: true }));
    const api = createClient({ fetch: fetchMock });

    api.interceptors.request.use((request) => {
      request.headers.set("Authorization", "Bearer test");
      return request;
    });

    api.interceptors.response.use((response) => {
      return { ...response, data: { ...(response.data as object), tagged: true } };
    });

    const data = await api.get("/secure");
    const headers = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);

    expect(headers.get("Authorization")).toBe("Bearer test");
    expect(data).toEqual({ ok: true, tagged: true });
  });

  it("times out slow requests", async () => {
    const api = createClient({
      timeout: 20,
      retry: false,
      fetch: (async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return jsonResponse({ ok: true });
      }) satisfies FetchMock,
    });

    await expect(api.get("/slow")).rejects.toBeInstanceOf(TimeoutError);
  });

  it("forwards browser credentials to fetch", async () => {
    const fetchMock = vi.fn<FetchMock>(async () => jsonResponse({ ok: true }));
    const api = createClient({
      fetch: fetchMock,
      credentials: "include",
    });

    await api.get("/me");
    expect(fetchMock.mock.calls[0]?.[1]?.credentials).toBe("include");
  });
});
