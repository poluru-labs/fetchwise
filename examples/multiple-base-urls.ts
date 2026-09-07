import { createDemoClient, HOSTS } from "./mock-api.ts";

const api = createDemoClient();

// default host: https://api.shop.test
const users = await api.get("/users");
console.log("default /users ->", users);

// named host from the baseURL map
const session = await api.get("/session", {
  baseURL: "auth",
  headers: { Authorization: "Bearer demo-token" },
});
console.log("auth /session ->", session);

const charges = await api.get("/charges", { baseURL: "payments" });
console.log("payments /charges ->", charges);

// one-off host for a single request
const welcome = await api.get("/posts/1", { baseURL: HOSTS.default });
console.log("absolute host /posts/1 ->", welcome);

// scoped client when a whole module only talks to one API
const payments = api.extend({ baseURL: { default: HOSTS.payments } });
const created = await payments.post("/charges", { amount: 2500 });
console.log("payments client POST /charges ->", created);
