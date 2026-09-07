import { createClient } from "../src/index.ts";

const api = createClient({
  baseURL: "https://jsonplaceholder.typicode.com",
});

const users = await api.get("/users", { query: { _limit: 2 } });
console.log("Users:", users);

const created = await api.post("/posts", {
  title: "Hello from fetchwise",
  body: "Works in plain JavaScript too.",
  userId: 1,
});
console.log("Created post:", created);
