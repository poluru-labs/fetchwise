# Vue

Industry pattern: a shared client, a Composition API composable, and SFCs.

```
vue/
  api.ts              shared createClient()
  useUsers.ts         composable with abort
  UsersList.vue       list + empty + retry
  CreateUserForm.vue  POST mutation
```

Works in Vue 3 and Nuxt 3. After `npm install @poluru-labs/fetchwise`:

```vue
<script setup>
import UsersList from "./UsersList.vue";
</script>

<template>
  <UsersList />
</template>
```
