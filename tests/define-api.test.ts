import { describe, expect, it, vi } from "vitest";
import { createClient } from "../src/client.js";
import { defineApi } from "../src/define-api.js";

describe("defineApi", () => {
  it("creates named methods from a route map", async () => {
    const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(
      async () => {
        return new Response(JSON.stringify({ id: 1, name: "Ada" }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    );

    const api = defineApi({
      client: createClient({
        baseURL: "https://api.example.com",
        fetch: fetchMock,
      }),
      routes: {
        getUser: {
          method: "GET",
          path: "/users/:id",
          schema: {
            parse: (data: unknown) => data as { id: number; name: string },
          },
        },
      },
    });

    const user = await api.getUser({ params: { id: 1 } });

    expect(user).toEqual({ id: 1, name: "Ada" });
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe("https://api.example.com/users/1");
  });
});
