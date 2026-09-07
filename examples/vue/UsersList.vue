<script setup lang="ts">
import { useUsers } from "./useUsers";
import CreateUserForm from "./CreateUserForm.vue";

const { users, error, pending, reload } = useUsers();
</script>

<template>
  <section>
    <h1>Users</h1>
    <p v-if="pending">Loading users…</p>
    <p v-else-if="error">
      {{ error }}
      <button type="button" @click="reload">Retry</button>
    </p>
    <p v-else-if="!users.length">No users yet.</p>
    <ul v-else>
      <li v-for="user in users" :key="user.id">{{ user.name }} — {{ user.email }}</li>
    </ul>
    <CreateUserForm @created="reload" />
  </section>
</template>
