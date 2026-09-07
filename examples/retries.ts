import { createClient } from "../src/index.ts";

const api = createClient({
  baseURL: "https://httpstat.us",
  retry: {
    attempts: 3,
    delay: 250,
    backoff: "exponential",
    jitter: false,
    retryOn: [408, 429, 500, 502, 503, 504],
  },
});

try {
  // 200 succeeds immediately. Change this to /503 to watch retries.
  const result = await api.get("/200", { parseAs: "text" });
  console.log("Success:", result);
} catch (error) {
  console.error("Gave up after retries:", error);
}
