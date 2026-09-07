import { onMounted, ref } from "vue";
import { createClient } from "@poluru-labs/fetchwise";

const api = createClient({
  baseURL: "/api",
  credentials: "include",
});

export function useUsers() {
  const users = ref([]);
  const error = ref("");

  onMounted(async () => {
    try {
      users.value = await api.get("/users");
    } catch (err) {
      error.value = err.message;
    }
  });

  return { users, error };
}
