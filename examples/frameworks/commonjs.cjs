const { createClient } = require("@poluru-labs/fetchwise");

const api = createClient({
  baseURL: "https://api.shop.com",
  retry: 2,
});

async function main() {
  const users = await api.get("/users");
  console.log(users);
}

main();
