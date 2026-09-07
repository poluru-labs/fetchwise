import { createDemoClient, HOSTS } from "../shared/mock-api.ts";

const api = createDemoClient();

const users = await api.get("/users");
console.log("default /users ->", users);

const session = await api.get("/session", {
  baseURL: "auth",
  headers: { Authorization: "Bearer demo-token" },
});
console.log("auth /session ->", session);

const charges = await api.get("/charges", { baseURL: "payments" });
console.log("payments /charges ->", charges);

const welcome = await api.get("/posts/1", { baseURL: HOSTS.default });
console.log("absolute host /posts/1 ->", welcome);

const payments = api.extend({ baseURL: { default: HOSTS.payments } });
const created = await payments.post("/charges", { amount: 2500 });
console.log("payments client POST /charges ->", created);
