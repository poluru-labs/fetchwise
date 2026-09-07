import { createDemoClient } from "../shared/mock-api.ts";

const api = createDemoClient({
  retry: {
    attempts: 3,
    delay: 40,
    backoff: "fixed",
    jitter: false,
    retryOn: [408, 429, 500, 502, 503, 504],
  },
});

const result = await api.get("/flaky");
console.log("Succeeded after retries:", result);
