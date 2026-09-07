import { useCallback, useEffect, useState } from "react";
import { HTTPError } from "@poluru-labs/fetchwise";
import { api, type User } from "./api";

type QueryState<T> = {
  data: T | null;
  error: string;
  loading: boolean;
  reload: () => void;
};

/**
 * Standard React data hook: abort in-flight work on unmount,
 * and expose loading / error / data.
 */
export function useUsers(): QueryState<User[]> {
  const [data, setData] = useState<User[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    api
      .get<User[]>("/users", { signal: controller.signal })
      .then((users) => {
        setData(users);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof HTTPError ? `HTTP ${err.status}` : "Could not load users");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [tick]);

  const reload = useCallback(() => setTick((value) => value + 1), []);

  return { data, error, loading, reload };
}
