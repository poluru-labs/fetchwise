import { HTTPError, TimeoutError } from "../src/index.ts";
import { createDemoClient } from "./mock-api.ts";

const api = createDemoClient({
  timeout: 8_000,
  retry: false,
});

try {
  await api.get("/this-route-does-not-exist");
} catch (error) {
  if (error instanceof HTTPError) {
    console.log("HTTP", error.status, error.url);
  } else if (error instanceof TimeoutError) {
    console.log("Timed out", error.url);
  } else {
    console.error(error);
  }
}
