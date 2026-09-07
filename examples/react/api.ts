import { createClient } from "@poluru-labs/fetchwise";

export type User = {
  id: number;
  name: string;
  email: string;
};

export type CreateUser = {
  name: string;
  email: string;
};

/**
 * One shared client per app.
 * In Vite / Next, point baseURL at your API or a proxy.
 */
export const api = createClient({
  baseURL: {
    default: "/api",
    auth: "/auth",
  },
  credentials: "include",
  timeout: 8_000,
  retry: 2,
});

api.interceptors.request.use((request) => {
  const token = localStorage.getItem("token");
  if (token) request.headers.set("Authorization", `Bearer ${token}`);
  return request;
});
