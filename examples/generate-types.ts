import { generateTypes } from "../src/index.ts";

const source = generateTypes({
  name: "ShopAPI",
  models: {
    User: "{ id: number; name: string; email: string }",
    CreateUser: "{ name: string; email: string }",
    Session: "{ token: string; userId: number }",
    Charge: "{ id: string; amount: number; currency: string }",
  },
  routes: [
    { method: "GET", path: "/users", response: "User[]" },
    { method: "GET", path: "/users/:id", params: "{ id: number }", response: "User" },
    { method: "POST", path: "/users", body: "CreateUser", response: "User" },
    { method: "GET", path: "/session", baseURL: "auth", response: "Session" },
    { method: "GET", path: "/charges", baseURL: "payments", response: "Charge[]" },
  ],
});

console.log(source);
