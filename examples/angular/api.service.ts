import { Injectable } from "@angular/core";
import { createClient } from "@poluru-labs/fetchwise";

export type User = {
  id: number;
  name: string;
  email: string;
};

export type CreateUser = {
  name: string;
  email: string;
};

/**
 * Root injectable service — the Angular equivalent of a shared axios instance.
 */
@Injectable({ providedIn: "root" })
export class ApiService {
  private readonly client = createClient({
    baseURL: {
      default: "/api",
      auth: "/auth",
    },
    credentials: "include",
    timeout: 8_000,
    retry: 2,
  });

  getUsers(signal?: AbortSignal) {
    return this.client.get<User[]>("/users", { signal });
  }

  createUser(body: CreateUser) {
    return this.client.post<User>("/users", body);
  }

  getSession() {
    return this.client.get("/session", { baseURL: "auth" });
  }
}
