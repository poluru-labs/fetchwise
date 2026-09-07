import { onScopeDispose, ref } from "vue";
import { HTTPError } from "@poluru-labs/fetchwise";
import { api, type User } from "./api";

/**
 * Vue composable — same contract as a Pinia action or useFetch:
 * data, error, pending, and a reload function.
 */
export function useUsers() {
  const users = ref<User[]>([]);
  const error = ref("");
  const pending = ref(true);
  let controller = new AbortController();

  async function load() {
    controller.abort();
    controller = new AbortController();
    pending.value = true;
    error.value = "";

    try {
      users.value = await api.get<User[]>("/users", { signal: controller.signal });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      error.value = err instanceof HTTPError ? `HTTP ${err.status}` : "Could not load users";
    } finally {
      pending.value = false;
    }
  }

  load();
  onScopeDispose(() => controller.abort());

  return { users, error, pending, reload: load };
}
