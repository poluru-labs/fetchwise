import { useUsers } from "./useUsers";
import { CreateUserForm } from "./CreateUserForm";

export function UsersList() {
  const { data: users, error, loading, reload } = useUsers();

  if (loading) return <p>Loading users…</p>;
  if (error) {
    return (
      <p>
        {error} <button onClick={reload}>Retry</button>
      </p>
    );
  }
  if (!users?.length) return <p>No users yet.</p>;

  return (
    <section>
      <h1>Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} — {user.email}
          </li>
        ))}
      </ul>
      <CreateUserForm onCreated={reload} />
    </section>
  );
}
