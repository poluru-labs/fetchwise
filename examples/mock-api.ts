import { createClient, type ClientOptions } from "../src/index.ts";

export type User = {
  id: number;
  name: string;
  email: string;
};

export type Session = {
  token: string;
  userId: number;
};

export type Charge = {
  id: string;
  amount: number;
  currency: string;
};

/** Three APIs on different hosts — the same client can talk to all of them. */
export const HOSTS = {
  default: "https://api.shop.test",
  auth: "https://auth.shop.test",
  payments: "https://payments.shop.test",
} as const;

const users: User[] = [
  { id: 1, name: "Poluru Ada", email: "poluru.ada@shop.test" },
  { id: 2, name: "Poluru Maya", email: "poluru.maya@shop.test" },
];

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function readBody(init?: RequestInit): Record<string, unknown> {
  if (!init?.body || typeof init.body !== "string") return {};
  return JSON.parse(init.body) as Record<string, unknown>;
}

/**
 * In-memory shop APIs. No network. Safe to run offline.
 *
 *   api.shop.test        /users  /users/:id  /posts/1  /flaky  /slow
 *   auth.shop.test       /session
 *   payments.shop.test   /charges
 */
export function createMockFetch(): typeof fetch {
  let flakyFailures = 0;

  return async (input, init) => {
    const url = new URL(String(input));
    const method = (init?.method ?? "GET").toUpperCase();
    const path = url.pathname;

    if (url.origin === HOSTS.auth) {
      if (path === "/session" && method === "GET") {
        const token = new Headers(init?.headers).get("authorization");
        if (token !== "Bearer demo-token") {
          return json({ message: "Unauthorized" }, 401);
        }
        return json({ token: "demo-token", userId: 1 } satisfies Session);
      }
    }

    if (url.origin === HOSTS.payments) {
      if (path === "/charges" && method === "GET") {
        return json([{ id: "ch_1", amount: 1999, currency: "usd" }] satisfies Charge[]);
      }
      if (path === "/charges" && method === "POST") {
        const body = readBody(init);
        return json(
          { id: "ch_2", amount: Number(body.amount ?? 0), currency: "usd" } satisfies Charge,
          201,
        );
      }
    }

    if (url.origin === HOSTS.default) {
      if (path === "/users" && method === "GET") {
        const limit = url.searchParams.get("limit");
        return json(limit ? users.slice(0, Number(limit)) : users);
      }

      const userMatch = path.match(/^\/users\/(\d+)$/);
      if (userMatch && method === "GET") {
        const user = users.find((item) => item.id === Number(userMatch[1]));
        return user ? json(user) : json({ message: "Not found" }, 404);
      }

      if (path === "/users" && method === "POST") {
        const body = readBody(init);
        return json(
          {
            id: 3,
            name: String(body.name ?? ""),
            email: String(body.email ?? ""),
          } satisfies User,
          201,
        );
      }

      if (path === "/posts/1" && method === "GET") {
        return json({ id: 1, title: "Welcome", body: "Shop API is online" });
      }

      if (path === "/flaky" && method === "GET") {
        flakyFailures += 1;
        if (flakyFailures < 3) return json({ error: "unavailable" }, 503);
        return json({ ok: true, attempts: flakyFailures });
      }

      if (path === "/slow" && method === "GET") {
        await new Promise((resolve) => setTimeout(resolve, 80));
        return json({ ok: true });
      }
    }

    return json({ message: `Not found: ${method} ${url.origin}${path}` }, 404);
  };
}

export function createDemoClient<TApi extends object = object>(
  options: ClientOptions = {},
) {
  return createClient<TApi>({
    ...options,
    baseURL: options.baseURL ?? HOSTS,
    fetch: options.fetch ?? createMockFetch(),
  });
}
