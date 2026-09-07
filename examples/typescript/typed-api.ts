import { defineApi } from "../../src/index.ts";
import { createDemoClient } from "../shared/mock-api.ts";
import type { CreateUser, ShopAPI, User } from "../shared/shop-api.ts";

const api = createDemoClient<ShopAPI>();

const users = await api.get("/users");
const ada = await api.get("/users/:id", { params: { id: 1 } });
const created = await api.post("/users", {
  name: "Poluru Ada",
  email: "poluru.ada@shop.test",
} satisfies CreateUser);
const session = await api.get("/session", {
  baseURL: "auth",
  headers: { Authorization: "Bearer demo-token" },
});

console.log("Typed client:", users.length, ada.name, created.id, session.token);

const routes = defineApi({
  client: api,
  routes: {
    getUser: {
      method: "GET",
      path: "/users/:id",
      schema: { parse: (data: unknown) => data as User },
    },
    getSession: {
      method: "GET",
      path: "/session",
      baseURL: "auth",
      headers: { Authorization: "Bearer demo-token" },
    },
    listCharges: {
      method: "GET",
      path: "/charges",
      baseURL: "payments",
    },
  },
});

const named = await routes.getUser({ params: { id: 1 } });
const namedSession = await routes.getSession();
console.log("Named routes:", named.email, namedSession);
