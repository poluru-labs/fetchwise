# modern fetchwise

A small, type-safe HTTP client for TypeScript and JavaScript. Built on the Fetch API.

This package is **not affiliated** with the existing npm package [`fetchwise`](https://www.npmjs.com/package/fetchwise). Install this one as `@poluru-labs/fetchwise`.

Works in **any JS environment** — browsers, Node, Deno, Bun, React Native, and frameworks like React, Vue, Angular, Lit, Next.js, and Nuxt.

Automatic retries · Response validation · Interceptors · Generated API types · Multiple API hosts

```ts
import { createClient } from "@poluru-labs/fetchwise";

const api = createClient({
  baseURL: {
    default: "https://api.shop.com",
    auth: "https://auth.shop.com",
  },
  retry: 3,
});

const users = await api.get("/users");
const session = await api.get("/session", { baseURL: "auth" });
```

## Install

```bash
npm install @poluru-labs/fetchwise
```

```bash
pnpm add @poluru-labs/fetchwise
yarn add @poluru-labs/fetchwise
bun add @poluru-labs/fetchwise
```

> The unscoped name `fetchwise` is already taken on npm, so this package is published as `@poluru-labs/fetchwise`.

## Works everywhere

| Environment | How to import |
| --- | --- |
| ESM / TypeScript | `import { createClient } from "@poluru-labs/fetchwise"` |
| CommonJS | `const { createClient } = require("@poluru-labs/fetchwise")` |
| Default import | `import fetchwise from "@poluru-labs/fetchwise"` |
| Browser `<script>` | `fetchwise.createClient(...)` via unpkg / jsDelivr |
| React, Vue, Angular, Lit | Same ESM import — no adapter |
| Next.js, Nuxt, SvelteKit, Remix | Same import on server and client |
| Deno / Bun / Workers | Same ESM import |

The core library has **no Node-only APIs**. It uses `globalThis.fetch`, so it runs anywhere Fetch exists.

```html
<script src="https://unpkg.com/@poluru-labs/fetchwise"></script>
<script>
  const api = fetchwise.createClient({ baseURL: "https://api.shop.com" });
  api.get("/users").then(console.log);
</script>
```

Examples by stack: [`examples/`](examples) — TypeScript, JavaScript, React, Vue, Angular, and Lit.

## Quick start

```ts
import { createClient } from "@poluru-labs/fetchwise";

type User = { id: number; name: string; email: string };

const api = createClient({
  baseURL: "https://api.shop.com",
  headers: { Accept: "application/json" },
  credentials: "include",
  timeout: 8_000,
  retry: { attempts: 3, delay: 300 },
});

const users = await api.get<User[]>("/users");
const user = await api.get<User>("/users/:id", { params: { id: 1 } });
const created = await api.post<User>("/users", {
  name: "Poluru Ada",
  email: "poluru.ada@shop.com",
});
```

Plain JavaScript is the same API. See [`examples/javascript`](examples/javascript).

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
npx @poluru-labs/fetchwise generate api.spec.json -o api.types.ts
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
import { defineApi } from "@poluru-labs/fetchwise";

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

Organized by stack in [`examples/`](examples):

| Folder | Pattern |
| --- | --- |
| [`typescript`](examples/typescript) | Generics, retries, generated types |
| [`javascript`](examples/javascript) | ESM, CommonJS, browser script |
| [`react`](examples/react) | Shared client + `useUsers` hook |
| [`vue`](examples/vue) | Composable + SFCs |
| [`angular`](examples/angular) | `ApiService` + signals |
| [`lit`](examples/lit) | LitElement custom elements |

```bash
npm install
npm run example examples/typescript/basic.ts
```

## API

### `createClient(options)`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `baseURL` | `string \| { default?: string; [name: string]: string }` | | Default host, or named hosts for multiple APIs |
| `headers` | `HeadersInit` | | Default headers |
| `credentials` | `RequestCredentials` | | Browser CORS cookies (`include`, `same-origin`) |
| `timeout` | `number` | | Request timeout in ms |
| `retry` | `number \| RetryOptions \| false` | `false` | Retry policy |
| `fetch` | `typeof fetch` | `globalThis.fetch` | Custom fetch implementation |

`fetchwise(options)` and the default export are aliases of `createClient(options)`.

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
import { HTTPError } from "@poluru-labs/fetchwise";

try {
  await api.get("/missing");
} catch (error) {
  if (error instanceof HTTPError || error?.name === "HTTPError") {
    console.log(error.status, error.data);
  }
}
```

Use `error.name` when multiple copies of the package are bundled.

## Security

See [SECURITY.md](SECURITY.md) for supported versions and how to report a vulnerability. Do not file public issues for security reports.

## Community

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). See [CONTRIBUTING.md](CONTRIBUTING.md) for how to set up the repo, run tests, and open a pull request.

Use [issue templates](https://github.com/poluru-labs/fetchwise/issues/new/choose) for bugs, features, and docs. Questions belong in [Discussions](https://github.com/poluru-labs/fetchwise/discussions).

## License

[MIT](LICENSE)
