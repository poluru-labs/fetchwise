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

/** Shared client for a Vue / Nuxt app. */
export const api = createClient({
  baseURL: {
    default: "/api",
    auth: "/auth",
  },
  credentials: "include",
  timeout: 8_000,
  retry: 2,
});
