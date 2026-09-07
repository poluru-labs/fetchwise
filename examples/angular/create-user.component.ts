import { Component, EventEmitter, Output, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HTTPError } from "@poluru-labs/fetchwise";
import { ApiService, type User } from "./api.service";

@Component({
  selector: "app-create-user",
  standalone: true,
  imports: [FormsModule],
  template: `
    <form (ngSubmit)="submit()">
      <input name="name" [(ngModel)]="name" required />
      <input name="email" type="email" [(ngModel)]="email" required />
      <button type="submit" [disabled]="saving()">
        {{ saving() ? "Saving…" : "Add user" }}
      </button>
      @if (error()) {
        <p>{{ error() }}</p>
      }
    </form>
  `,
})
export class CreateUserComponent {
  private readonly api = inject(ApiService);

  @Output() readonly created = new EventEmitter<User>();

  name = "Poluru Arun";
  email = "poluru.arun@shop.test";
  readonly saving = signal(false);
  readonly error = signal("");

  async submit() {
    this.saving.set(true);
    this.error.set("");

    try {
      const user = await this.api.createUser({ name: this.name, email: this.email });
      this.created.emit(user);
    } catch (err) {
      this.error.set(err instanceof HTTPError ? `HTTP ${err.status}` : "Could not create user");
    } finally {
      this.saving.set(false);
    }
  }
}
