import { generateTypes } from "../src/index.ts";

const source = generateTypes({
  name: "JsonPlaceholder",
  models: {
    User: "{ id: number; name: string; email: string }",
    CreateUser: "{ name: string; email: string }",
  },
  routes: [
    { method: "GET", path: "/users", response: "User[]" },
    { method: "GET", path: "/users/:id", params: "{ id: number }", response: "User" },
    { method: "POST", path: "/users", body: "CreateUser", response: "User" },
  ],
});

console.log(source);
