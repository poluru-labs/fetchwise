import { HTTPError } from "../src/index.ts";
import { createDemoClient } from "./mock-api.ts";

const api = createDemoClient();

api.interceptors.request.use((request) => {
  request.headers.set("Authorization", "Bearer demo-token");
  request.headers.set("X-Request-Id", crypto.randomUUID());
  console.log("->", request.method, request.url);
  return request;
});

api.interceptors.response.use((response) => {
  console.log("<-", response.status, response.url);
  return response;
});

api.interceptors.error.use((error) => {
  if (error instanceof HTTPError && error.status === 401) {
    console.error("Session expired");
  }
  return error;
});

const session = await api.get("/session", { baseURL: "auth" });
console.log(session);
