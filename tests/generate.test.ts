import { describe, expect, it } from "vitest";
import { generateTypes } from "../src/generate.js";

describe("generateTypes", () => {
  it("creates an API interface from a spec", () => {
    const source = generateTypes({
      name: "PetsAPI",
      models: {
        Pet: "{ id: number; name: string }",
      },
      routes: [
        { method: "GET", path: "/pets", response: "Pet[]" },
        { method: "POST", path: "/pets", body: "{ name: string }", response: "Pet" },
      ],
    });

    expect(source).toContain("export interface Pet { id: number; name: string }");
    expect(source).toContain("'GET /pets': Pet[]");
    expect(source).toContain("body: { name: string }");
    expect(source).toContain("export interface PetsAPI");
  });
});
