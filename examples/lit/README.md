# Lit

Industry pattern: a shared client and LitElement custom elements with reactive state.

```
lit/
  api.ts           shared createClient()
  users-list.ts    <users-list> with abort on disconnect
  create-user.ts   <create-user> POST form
  index.html       drop-in page
```

Works in any Lit or vanilla project. After `npm install @poluru-labs/fetchwise lit`:

```html
<script type="module" src="./users-list.ts"></script>
<users-list></users-list>
```
