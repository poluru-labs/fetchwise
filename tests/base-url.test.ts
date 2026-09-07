import { describe, expect, it, vi } from "vitest";
import { createClient } from "../src/client.js";
import { defineApi } from "../src/define-api.js";
import { FetchwiseError } from "../src/errors.js";
import { mergeBaseURL, resolveBaseURL } from "../src/url.js";

type FetchMock = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}

describe("resolveBaseURL", () => {
  it("uses a string host", () => {
    expect(resolveBaseURL("https://api.shop.com")).toBe("https://api.shop.com");
  });

  it("uses the default named host", () => {
    expect(
      resolveBaseURL({
        default: "https://api.shop.com",
        auth: "https://auth.shop.com",
      }),
    ).toBe("https://api.shop.com");
  });

  it("selects a named host or a one-off URL", () => {
    const hosts = {
      default: "https://api.shop.com",
      auth: "https://auth.shop.com",
    };

    expect(resolveBaseURL(hosts, "auth")).toBe("https://auth.shop.com");
    expect(resolveBaseURL(hosts, "https://status.shop.com")).toBe(
      "https://status.shop.com",
    );
  });

  it("throws for an unknown name", () => {
    expect(() => resolveBaseURL({ default: "https://api.shop.com" }, "billing")).toThrow(
      /Unknown baseURL "billing"/,
    );
  });
});

describe("mergeBaseURL", () => {
  it("merges named hosts when extending a client", () => {
    expect(
      mergeBaseURL(
        { default: "https://api.shop.com", auth: "https://auth.shop.com" },
        { payments: "https://payments.shop.com" },
      ),
    ).toEqual({
      default: "https://api.shop.com",
      auth: "https://auth.shop.com",
      payments: "https://payments.shop.com",
    });
  });
});

describe("client baseURL", () => {
  it("routes requests across named hosts", async () => {
    const fetchMock = vi.fn<FetchMock>(async () => jsonResponse({ ok: true }));
    const api = createClient({
      baseURL: {
        default: "https://api.shop.com",
        auth: "https://auth.shop.com",
        payments: "https://payments.shop.com",
      },
      fetch: fetchMock,
    });

    await api.get("/users");
    await api.get("/session", { baseURL: "auth" });
    await api.get("/charges", { baseURL: "payments" });
    await api.get("/health", { baseURL: "https://status.shop.com" });
    await api.get("https://edge.shop.com/ping");

    expect(fetchMock.mock.calls.map((call) => String(call[0]))).toEqual([
      "https://api.shop.com/users",
      "https://auth.shop.com/session",
      "https://payments.shop.com/charges",
      "https://status.shop.com/health",
      "https://edge.shop.com/ping",
    ]);
  });

  it("lets extend() add another API host", async () => {
    const fetchMock = vi.fn<FetchMock>(async () => jsonResponse({ id: "ch_2" }));
    const api = createClient({
      baseURL: { default: "https://api.shop.com" },
      fetch: fetchMock,
    }).extend({
      baseURL: { payments: "https://payments.shop.com" },
    });

    const payments = api.extend({ baseURL: { default: "https://payments.shop.com" } });
    await payments.post("/charges", { amount: 2500 });

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe("https://payments.shop.com/charges");
  });

  it("rejects an unknown host name before fetching", async () => {
    const fetchMock = vi.fn<FetchMock>(async () => jsonResponse({}));
    const api = createClient({
      baseURL: { default: "https://api.shop.com" },
      fetch: fetchMock,
      retry: 3,
    });

    await expect(api.get("/x", { baseURL: "nope" })).rejects.toBeInstanceOf(FetchwiseError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("defineApi baseURL", () => {
  it("sends a named route to a different host", async () => {
    const fetchMock = vi.fn<FetchMock>(async () => jsonResponse({ token: "demo" }));
    const api = defineApi({
      client: createClient({
        baseURL: {
          default: "https://api.shop.com",
          auth: "https://auth.shop.com",
        },
        fetch: fetchMock,
      }),
      routes: {
        getSession: { method: "GET", path: "/session", baseURL: "auth" },
      },
    });

    await api.getSession();
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe("https://auth.shop.com/session");
  });
});
