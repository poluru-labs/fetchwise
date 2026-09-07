import { createDemoClient } from "./mock-api.ts";

const api = createDemoClient({
  retry: {
    attempts: 3,
    delay: 40,
    backoff: "fixed",
    jitter: false,
    retryOn: [408, 429, 500, 502, 503, 504],
  },
});

// /flaky returns 503 twice, then 200.
const result = await api.get("/flaky");
console.log("Succeeded after retries:", result);
