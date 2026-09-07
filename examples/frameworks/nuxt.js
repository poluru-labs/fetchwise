import { createClient } from "@poluru-labs/fetchwise";

export const api = createClient({
  baseURL: { default: "/api", auth: "/auth" },
  credentials: "include",
});

export function useSession() {
  return api.get("/session", { baseURL: "auth" });
}
