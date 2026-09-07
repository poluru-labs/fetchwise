// Node CommonJS — after: npm install @poluru-labs/fetchwise
const { createClient } = require("@poluru-labs/fetchwise");

const api = createClient({
  baseURL: "https://api.shop.com",
  retry: 2,
});

async function main() {
  const users = await api.get("/users");
  console.log(users);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
