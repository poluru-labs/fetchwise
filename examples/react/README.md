# React

Industry pattern: a singleton client, a data hook with `AbortController`, and presentational components.

```
react/
  api.ts              shared createClient()
  useUsers.ts         loading / error / data hook
  UsersList.tsx       list + empty + retry
  CreateUserForm.tsx  POST mutation
```

Drop these into a Vite or Next.js app after `npm install @poluru-labs/fetchwise`.

```tsx
import { UsersList } from "./UsersList";

export function App() {
  return <UsersList />;
}
```
