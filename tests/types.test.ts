import { describe, expectTypeOf, it } from "vitest";
import { createClient } from "../src/client.js";

type User = { id: number; name: string };
type CreateUser = { name: string };

interface API {
  "GET /users": User[];
  "GET /users/:id": User;
  "POST /users": { body: CreateUser; response: User };
}

describe("typed client", () => {
  const api = createClient<API>();

  it("infers responses from the API map", () => {
    expectTypeOf(() => api.get("/users")).returns.toEqualTypeOf<Promise<User[]>>();
    expectTypeOf(() => api.get("/users/:id")).returns.toEqualTypeOf<Promise<User>>();
    expectTypeOf(() => api.post("/users", { name: "Ada" })).returns.toEqualTypeOf<Promise<User>>();
  });

  it("still accepts an explicit response type", () => {
    const untyped = createClient();
    expectTypeOf(() => untyped.get<User[]>("/users")).returns.toEqualTypeOf<Promise<User[]>>();
  });
});
