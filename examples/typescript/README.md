# TypeScript

Typed client, retries, interceptors, validation, and generated API types.

```bash
npm run example examples/typescript/basic.ts
npm run example examples/typescript/typed-api.ts
```

| File | Pattern |
| --- | --- |
| `basic.ts` | GET / POST with generics and path params |
| `multiple-hosts.ts` | Named `baseURL` map and `extend()` |
| `retries.ts` | Backoff against a flaky route |
| `interceptors.ts` | Auth header and error interceptor |
| `validation.ts` | `schema.parse()` on the response |
| `typed-api.ts` | Generated `ShopAPI` + `defineApi()` |
| `error-handling.ts` | `HTTPError` / `TimeoutError` |
| `generate-types.ts` | Print types from a spec |

```ts
import { createClient } from "@poluru-labs/fetchwise";

type User = { id: number; name: string; email: string };

const api = createClient({
  baseURL: "https://api.shop.com",
  timeout: 8_000,
  retry: 3,
});

const users = await api.get<User[]>("/users");
```
