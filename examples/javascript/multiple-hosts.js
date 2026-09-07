import { createDemoClient } from "../shared/mock-api.ts";

const api = createDemoClient();

const users = await api.get("/users");
const session = await api.get("/session", {
  baseURL: "auth",
  headers: { Authorization: "Bearer demo-token" },
});
const charges = await api.get("/charges", { baseURL: "payments" });

console.log({ users, session, charges });
