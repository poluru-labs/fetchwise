import { createClient, ValidationError } from "../src/index.ts";

type User = {
  id: number;
  name: string;
  email: string;
};

// Any object with parse() works — including Zod, Valibot, and ArkType.
const UserSchema = {
  parse(data: unknown): User {
    if (!data || typeof data !== "object") {
      throw new Error("Expected an object");
    }

    const value = data as Record<string, unknown>;
    if (typeof value.id !== "number") throw new Error("id must be a number");
    if (typeof value.name !== "string") throw new Error("name must be a string");
    if (typeof value.email !== "string") throw new Error("email must be a string");

    return { id: value.id, name: value.name, email: value.email };
  },
};

const api = createClient({
  baseURL: "https://jsonplaceholder.typicode.com",
});

const user = await api.get("/users/1", { schema: UserSchema });
console.log("Validated user:", user.name, user.email);

try {
  await api.get("/users", { schema: UserSchema });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log("Array payload correctly rejected by UserSchema");
  }
}
