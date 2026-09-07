import { createClient, defineApi } from "../src/index.ts";
import type { CreateUser, JsonPlaceholder, User } from "./jsonplaceholder.ts";

// 1) Use generated types from `fetchwise generate examples/api.spec.json`
const client = createClient<JsonPlaceholder>({
  baseURL: "https://jsonplaceholder.typicode.com",
});

const users = await client.get("/users");
const ada = await client.get("/users/:id", { params: { id: 1 } });
const created = await client.post("/users", {
  name: "Ada",
  email: "ada@example.com",
} satisfies CreateUser);

console.log("Typed client:", users.length, ada.name, created.id);

// 2) Named methods from a route map
const api = defineApi({
  client,
  routes: {
    getUser: {
      method: "GET",
      path: "/users/:id",
      schema: { parse: (data: unknown) => data as User },
    },
    createUser: {
      method: "POST",
      path: "/users",
      schema: { parse: (data: unknown) => data as User },
    },
  },
});

const named = await api.getUser({ params: { id: 1 } });
console.log("Named route:", named.email);
