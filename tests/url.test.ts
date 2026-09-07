import { describe, expect, it } from "vitest";
import { applyParams, applyQuery, joinURL, resolveURL } from "../src/url.js";

describe("joinURL", () => {
  it("joins base and path without extra slashes", () => {
    expect(joinURL("https://api.example.com/", "/users")).toBe(
      "https://api.example.com/users",
    );
  });

  it("keeps absolute paths as-is", () => {
    expect(joinURL("https://api.example.com", "https://other.test/x")).toBe(
      "https://other.test/x",
    );
  });

  it("does not prefix an absolute URL with another host", () => {
    expect(joinURL("https://api.shop.com", "https://payments.shop.com/charges")).toBe(
      "https://payments.shop.com/charges",
    );
  });
});

describe("applyParams", () => {
  it("replaces named path params", () => {
    expect(applyParams("/users/:id/posts/:postId", { id: 1, postId: 9 })).toBe(
      "/users/1/posts/9",
    );
  });

  it("leaves missing params in the path", () => {
    expect(applyParams("/users/:id", {})).toBe("/users/:id");
  });
});

describe("applyQuery", () => {
  it("skips nullish values and supports arrays", () => {
    expect(
      applyQuery("/users", { page: 1, empty: null, tags: ["a", "b"] }),
    ).toBe("/users?page=1&tags=a&tags=b");
  });
});

describe("resolveURL", () => {
  it("builds a complete request URL", () => {
    expect(
      resolveURL("https://api.example.com", "/users/:id", { id: 7 }, { expand: true }),
    ).toBe("https://api.example.com/users/7?expand=true");
  });
});
