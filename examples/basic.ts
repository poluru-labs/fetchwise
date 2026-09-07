import { createDemoClient } from "./mock-api.ts";
import type { User } from "./mock-api.ts";

const api = createDemoClient({
  headers: { Accept: "application/json" },
  timeout: 8_000,
});

const users = await api.get<User[]>("/users");
console.log("GET api.shop.test/users ->", users);

const user = await api.get<User>("/users/:id", { params: { id: 1 } });
console.log("GET api.shop.test/users/1 ->", user);

const created = await api.post<User>("/users", {
  name: "Poluru Arun",
  email: "poluru.arun@shop.test",
});
console.log("POST api.shop.test/users ->", created);
