import { HTTPError } from "../../src/index.ts";
import { createDemoClient } from "../shared/mock-api.ts";

const api = createDemoClient({ retry: false });

try {
  await api.get("/missing");
} catch (error) {
  if (error instanceof HTTPError) {
    console.log("HTTP", error.status, error.url);
  } else {
    console.error(error);
  }
}
