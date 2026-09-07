import { createClient } from "../src/index.ts";

type User = {
  id: number;
  name: string;
  email: string;
};

const api = createClient({
  baseURL: "https://jsonplaceholder.typicode.com",
  headers: { Accept: "application/json" },
  timeout: 8_000,
});

const users = await api.get<User[]>("/users");
console.log("GET /users ->", users.slice(0, 2));

const user = await api.get<User>("/users/:id", { params: { id: 1 } });
console.log("GET /users/1 ->", user);

const created = await api.post<User>("/users", {
  name: "Ada Lovelace",
  email: "ada@example.com",
});
console.log("POST /users ->", created);
