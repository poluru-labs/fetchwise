import { createDemoClient } from "./mock-api.ts";

const api = createDemoClient();

const users = await api.get("/users", { query: { limit: 1 } });
console.log("Users:", users);

const created = await api.post("/users", {
  name: "Poluru Arun",
  email: "poluru.arun@shop.test",
});
console.log("Created user:", created);
