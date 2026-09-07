import { createClient, HTTPError } from "../src/index.ts";

const api = createClient({
  baseURL: "https://jsonplaceholder.typicode.com",
});

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

const post = await api.get("/posts/1");
console.log(post);
