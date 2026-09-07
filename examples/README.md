# How to use fetchwise

These examples talk to a local mock shop API (`mock-api.ts`). Nothing hits the network.

The mock exposes three hosts so you can see how one client handles multiple APIs:

| Name | Host | Routes |
| --- | --- | --- |
| `default` | `https://api.shop.test` | `/users`, `/users/:id`, `/posts/1`, `/flaky`, `/slow` |
| `auth` | `https://auth.shop.test` | `/session` |
| `payments` | `https://payments.shop.test` | `/charges` |

## Run locally

From the repository root:

```bash
npm install
npm run example examples/basic.ts
npm run example examples/multiple-base-urls.ts
```

| File | What it shows |
| --- | --- |
| `mock-api.ts` | In-memory multi-host API used by every example |
| `basic.ts` | GET / POST, path params, TypeScript types |
| `javascript.js` | Same client from plain JavaScript |
| `multiple-base-urls.ts` | Named hosts, per-request overrides, `extend()` |
| `retries.ts` | Automatic retries against `/flaky` |
| `interceptors.ts` | Request, response, and error interceptors |
| `validation.ts` | Response validation with a `parse()` schema |
| `typed-api.ts` | Generated route types + `defineApi()` |
| `generate-types.ts` | Print TypeScript types from a spec |
| `error-handling.ts` | `HTTPError` and `TimeoutError` |
| `api.spec.json` | Input for the type generator |
| `shop-api.ts` | Sample output from `fetchwise generate` |

## Multiple API hosts

```ts
const api = createClient({
  baseURL: {
    default: "https://api.shop.test",
    auth: "https://auth.shop.test",
    payments: "https://payments.shop.test",
  },
});

await api.get("/users");
await api.get("/session", { baseURL: "auth" });
await api.get("/charges", { baseURL: "payments" });
await api.get("/health", { baseURL: "https://status.shop.test" });
```

A path that is already a full URL is left as-is.

## Generate API types

```bash
npm run build
node dist/cli.js generate examples/api.spec.json -o examples/shop-api.ts
```

```ts
import { createClient } from "fetchwise";
import type { ShopAPI } from "./shop-api.ts";

const api = createClient<ShopAPI>({
  baseURL: {
    default: "https://api.shop.test",
    auth: "https://auth.shop.test",
    payments: "https://payments.shop.test",
  },
});

const users = await api.get("/users");
const session = await api.get("/session", { baseURL: "auth" });
```

## Copy-paste starter

```ts
import { createClient } from "fetchwise";

const api = createClient({
  baseURL: {
    default: "https://api.shop.com",
    auth: "https://auth.shop.com",
    payments: "https://payments.shop.com",
  },
  timeout: 8_000,
  retry: 3,
});

api.interceptors.request.use((request) => {
  request.headers.set("Authorization", `Bearer ${process.env.API_TOKEN}`);
  return request;
});

export const getUsers = () => api.get("/users");
export const getSession = () => api.get("/session", { baseURL: "auth" });
```
