# How to use fetchwise

These examples are the fastest way to learn the library. Each file is small and focused on one idea.

## Run locally

From the repository root:

```bash
npm install
npm run example examples/basic.ts
```

Replace `basic.ts` with any other file in this folder.

| File | What it shows |
| --- | --- |
| `basic.ts` | GET / POST, path params, TypeScript types |
| `javascript.js` | Same client from plain JavaScript |
| `retries.ts` | Automatic retries with backoff |
| `interceptors.ts` | Request, response, and error interceptors |
| `validation.ts` | Response validation with a `parse()` schema |
| `typed-api.ts` | Generated route types + `defineApi()` |
| `generate-types.ts` | Print TypeScript types from a spec |
| `error-handling.ts` | `HTTPError` and `TimeoutError` |
| `api.spec.json` | Input for the type generator |
| `jsonplaceholder.ts` | Sample output from `fetchwise generate` |

## Generate API types

```bash
npm run build
node dist/cli.js generate examples/api.spec.json -o examples/jsonplaceholder.ts
```

Then import the generated interface:

```ts
import { createClient } from "fetchwise";
import type { JsonPlaceholder } from "./jsonplaceholder.ts";

const api = createClient<JsonPlaceholder>({
  baseURL: "https://jsonplaceholder.typicode.com",
});

const users = await api.get("/users");
```

## Copy-paste starter

```ts
import { createClient } from "fetchwise";

const api = createClient({
  baseURL: "https://api.example.com",
  timeout: 8_000,
  retry: 3,
});

api.interceptors.request.use((request) => {
  request.headers.set("Authorization", `Bearer ${process.env.API_TOKEN}`);
  return request;
});

export const getUsers = () => api.get("/users");
```
