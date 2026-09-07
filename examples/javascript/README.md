# JavaScript

ESM, CommonJS, and a browser `<script>` tag. No TypeScript required.

```bash
npm run example examples/javascript/basic.js
npm run example examples/javascript/multiple-hosts.js
```

| File | Pattern |
| --- | --- |
| `basic.js` | ESM GET / POST |
| `multiple-hosts.js` | Named API hosts |
| `error-handling.js` | `HTTPError` |
| `commonjs.cjs` | `require()` in Node |
| `vanilla.html` | Global build in the browser |

```js
import { createClient } from "@poluru-labs/fetchwise";

const api = createClient({
  baseURL: "https://api.shop.com",
  retry: 2,
});

const users = await api.get("/users");
```
