import { Injectable } from "@angular/core";
import { createClient } from "@poluru-labs/fetchwise";

@Injectable({ providedIn: "root" })
export class ApiService {
  private readonly api = createClient({
    baseURL: "/api",
    credentials: "include",
    retry: 2,
  });

  getUsers() {
    return this.api.get("/users");
  }
}
