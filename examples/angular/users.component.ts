import { Component, OnDestroy, OnInit, inject, signal } from "@angular/core";
import { HTTPError } from "@poluru-labs/fetchwise";
import { ApiService, type User } from "./api.service";
import { CreateUserComponent } from "./create-user.component";

@Component({
  selector: "app-users",
  standalone: true,
  imports: [CreateUserComponent],
  templateUrl: "./users.component.html",
})
export class UsersComponent implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private controller = new AbortController();

  readonly users = signal<User[]>([]);
  readonly error = signal("");
  readonly loading = signal(true);

  ngOnInit() {
    void this.load();
  }

  ngOnDestroy() {
    this.controller.abort();
  }

  async load() {
    this.controller.abort();
    this.controller = new AbortController();
    this.loading.set(true);
    this.error.set("");

    try {
      this.users.set(await this.api.getUsers(this.controller.signal));
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      this.error.set(err instanceof HTTPError ? `HTTP ${err.status}` : "Could not load users");
    } finally {
      this.loading.set(false);
    }
  }
}
