import { createClient } from "@poluru-labs/fetchwise";

// Works in Server Components, Route Handlers, and the browser.
export const api = createClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "https://api.shop.com",
  retry: 2,
});

export async function getUsers() {
  return api.get("/users");
}
