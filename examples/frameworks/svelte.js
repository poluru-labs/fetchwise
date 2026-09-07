import { createClient } from "@poluru-labs/fetchwise";

export const api = createClient({
  baseURL: "/api",
  credentials: "include",
});

// In a .svelte file:
// <script>
//   import { api } from "./api.js";
//   let users = [];
//   users = await api.get("/users");
// </script>
