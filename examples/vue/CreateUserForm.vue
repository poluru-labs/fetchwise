<script setup lang="ts">
import { ref } from "vue";
import { HTTPError } from "@poluru-labs/fetchwise";
import { api, type User } from "./api";

const emit = defineEmits<{ created: [user: User] }>();

const name = ref("Poluru Arun");
const email = ref("poluru.arun@shop.test");
const saving = ref(false);
const error = ref("");

async function onSubmit() {
  saving.value = true;
  error.value = "";

  try {
    const user = await api.post<User>("/users", {
      name: name.value,
      email: email.value,
    });
    emit("created", user);
  } catch (err) {
    error.value = err instanceof HTTPError ? `HTTP ${err.status}` : "Could not create user";
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <input v-model="name" required />
    <input v-model="email" type="email" required />
    <button type="submit" :disabled="saving">
      {{ saving ? "Saving…" : "Add user" }}
    </button>
    <p v-if="error">{{ error }}</p>
  </form>
</template>
