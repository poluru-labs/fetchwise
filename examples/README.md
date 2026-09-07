# Examples

Organized by language and framework. TypeScript and JavaScript run against the local mock in `shared/`. The others are copy-paste starters for a real app.

```
examples/
  shared/         mock API, generated types
  typescript/     typed client, retries, interceptors
  javascript/     ESM, CommonJS, browser script
  react/          client + hook + components
  vue/            client + composable + SFCs
  angular/        injectable service + standalone components
  lit/            LitElement custom elements
```

## Run TypeScript / JavaScript

```bash
npm install
npm run example examples/typescript/basic.ts
npm run example examples/javascript/basic.js
```

| Folder | What to copy |
| --- | --- |
| [typescript](typescript) | Generics, `defineApi()`, validation |
| [javascript](javascript) | ESM, CJS, `<script>` |
| [react](react) | `api.ts`, `useUsers`, list + form |
| [vue](vue) | composable + SFCs |
| [angular](angular) | `ApiService` + signals |
| [lit](lit) | `<users-list>` and `<create-user>` |

## Shared mock

`shared/mock-api.ts` is an in-memory shop API (no network):

| Name | Host | Routes |
| --- | --- | --- |
| `default` | `https://api.shop.test` | `/users`, `/users/:id`, `/posts/1`, `/flaky`, `/slow` |
| `auth` | `https://auth.shop.test` | `/session` |
| `payments` | `https://payments.shop.test` | `/charges` |

```bash
npm run build
node dist/cli.js generate examples/shared/api.spec.json -o examples/shared/shop-api.ts
```
