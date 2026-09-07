import { FormEvent, useState } from "react";
import { HTTPError } from "@poluru-labs/fetchwise";
import { api, type User } from "./api";

type Props = {
  onCreated?: (user: User) => void;
};

export function CreateUserForm({ onCreated }: Props) {
  const [name, setName] = useState("Poluru Arun");
  const [email, setEmail] = useState("poluru.arun@shop.test");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const user = await api.post<User>("/users", { name, email });
      onCreated?.(user);
    } catch (err) {
      setError(err instanceof HTTPError ? `HTTP ${err.status}` : "Could not create user");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <input value={name} onChange={(event) => setName(event.target.value)} required />
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Add user"}
      </button>
      {error ? <p>{error}</p> : null}
    </form>
  );
}
