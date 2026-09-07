# fetchwise

A small, type-safe HTTP client for TypeScript and JavaScript. Built on the Fetch API.

Automatic retries · Response validation · Interceptors · Generated API types

```ts
import { createClient } from "fetchwise";

const api = createClient({
  baseURL: {
    default: "https://api.shop.com",
    auth: "https://auth.shop.com",
    payments: "https://payments.shop.com",
  },
  retry: 3,
});

const users = await api.get("/users");
const session = await api.get("/session", { baseURL: "auth" });
```

## Install

```bash
npm install fetchwise
```

Works in Node.js 18+, browsers, and any runtime with `fetch`.

## Quick start

```ts
import { createClient } from "fetchwise";

type User = { id: number; name: string; email: string };

const api = createClient({
  baseURL: "https://api.shop.com",
  headers: { Accept: "application/json" },
  timeout: 8_000,
  retry: { attempts: 3, delay: 300 },
});

const users = await api.get<User[]>("/users");
const user = await api.get<User>("/users/:id", { params: { id: 1 } });
const created = await api.post<User>("/users", { name: "Poluru Ada", email: "poluru.ada@shop.com" });
```

The same API works from JavaScript. See [`examples/javascript.js`](examples/javascript.js).

## Features

### Automatic retries

Failed network calls, timeouts, and selected HTTP statuses are retried with backoff.

```ts
const api = createClient({
  baseURL: "https://api.example.com",
  retry: {
    attempts: 3,
    delay: 300,
    backoff: "exponential",
    retryOn: [408, 429, 500, 502, 503, 504],
  },
});
```

Pass `retry: 3` for defaults, or `retry: false` to turn retries off.

### Multiple API hosts

`baseURL` can be one host or a map of names. Pick a host per request, pass a full URL, or `extend()` a client for one API.

```ts
const api = createClient({
  baseURL: {
    default: "https://api.shop.com",
    auth: "https://auth.shop.com",
    payments: "https://payments.shop.com",
  },
});

await api.get("/users");
await api.get("/session", { baseURL: "auth" });
await api.get("/charges", { baseURL: "payments" });
await api.get("/health", { baseURL: "https://status.shop.com" });
await api.get("https://edge.shop.com/ping");

const payments = api.extend({ baseURL: { default: "https://payments.shop.com" } });
await payments.post("/charges", { amount: 2500 });
```

### Response validation

Pass any schema with a `parse()` method. Zod, Valibot, ArkType, or a tiny custom object all work.

```ts
const UserSchema = {
  parse(data: unknown): User {
    // throw if the payload is not a User
    return data as User;
  },
};

const user = await api.get("/users/1", { schema: UserSchema });
```

Invalid payloads throw `ValidationError`.

### Request and response interceptors

```ts
api.interceptors.request.use((request) => {
  request.headers.set("Authorization", `Bearer ${token}`);
  return request;
});

api.interceptors.response.use((response) => {
  console.log(response.status, response.url);
  return response;
});

api.interceptors.error.use((error) => {
  if (error.status === 401) logout();
  return error;
});
```

### Generated API types

Describe routes once. fetchwise infers params, bodies, and responses.

```ts
interface API {
  "GET /users": User[];
  "GET /users/:id": User;
  "POST /users": { body: CreateUser; response: User };
}

const api = createClient<API>({ baseURL: "https://api.shop.com" });

const users = await api.get("/users");
const user = await api.get("/users/:id", { params: { id: 1 } });
const created = await api.post("/users", { name: "Poluru Ada", email: "poluru.ada@shop.com" });
```

Or generate that interface from JSON:

```bash
npx fetchwise generate api.spec.json -o api.types.ts
```

```json
{
  "name": "API",
  "models": {
    "User": "{ id: number; name: string; email: string }"
  },
  "routes": [
    { "method": "GET", "path": "/users", "response": "User[]" },
    { "method": "POST", "path": "/users", "body": "CreateUser", "response": "User" }
  ]
}
```

Named methods are available too:

```ts
import { defineApi } from "fetchwise";

const users = defineApi({
  client: api,
  routes: {
    getUser: { method: "GET", path: "/users/:id" },
    createUser: { method: "POST", path: "/users" },
  },
});

await users.getUser({ params: { id: 1 } });
```

## Examples

Step-by-step files live in [`examples/`](examples). Start here:

```bash
npm install
npm run example examples/basic.ts
```

How to run each example, generate types, and copy a starter snippet: [`examples/README.md`](examples/README.md).

## API

### `createClient(options)`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `baseURL` | `string \| { default?: string; [name: string]: string }` | | Default host, or named hosts for multiple APIs |
| `headers` | `HeadersInit` | | Default headers |
| `timeout` | `number` | | Request timeout in ms |
| `retry` | `number \| RetryOptions \| false` | `false` | Retry policy |
| `fetch` | `typeof fetch` | `globalThis.fetch` | Custom fetch implementation |

`fetchwise(options)` is an alias of `createClient(options)`.

### Methods

```ts
api.get(url, config?)
api.post(url, body?, config?)
api.put(url, body?, config?)
api.patch(url, body?, config?)
api.delete(url, config?)
api.request(url, config?)   // returns parsed data
api.send(url, config?)      // returns { data, status, headers, raw }
api.extend(options)         // copy the client with new defaults
```

### Request config

```ts
{
  baseURL, // named host or full URL for this request
  headers, query, params, body,
  timeout, retry, schema, signal,
  parseAs: "json" | "text" | "blob" | "auto" | "raw",
  fetchOptions, // extra Fetch init
}
```

Path tokens like `/users/:id` are filled from `params`.

### Errors

| Class | When |
| --- | --- |
| `HTTPError` | Response status is not 2xx |
| `TimeoutError` | The request exceeded `timeout` |
| `ValidationError` | `schema.parse()` failed |
| `FetchwiseError` | Network, abort, or other failures |

```ts
import { HTTPError } from "fetchwise";

try {
  await api.get("/missing");
} catch (error) {
  if (error instanceof HTTPError) {
    console.log(error.status, error.data);
  }
}
```

## License

[MIT](LICENSE)
