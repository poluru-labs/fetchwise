import { useEffect, useState } from "react";
import { createClient, HTTPError } from "@poluru-labs/fetchwise";

const api = createClient({
  baseURL: "/api",
  credentials: "include",
  retry: 2,
});

export function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    api
      .get("/users")
      .then((data) => {
        if (!ignore) setUsers(data);
      })
      .catch((err) => {
        if (!ignore) {
          setError(err instanceof HTTPError ? `HTTP ${err.status}` : "Request failed");
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  if (error) return <p>{error}</p>;
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
