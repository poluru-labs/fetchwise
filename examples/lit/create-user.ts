import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { HTTPError } from "@poluru-labs/fetchwise";
import { api, type User } from "./api.js";

@customElement("create-user")
export class CreateUser extends LitElement {
  @state() private name = "Poluru Arun";
  @state() private email = "poluru.arun@shop.test";
  @state() private saving = false;
  @state() private error = "";

  private async onSubmit(event: Event) {
    event.preventDefault();
    this.saving = true;
    this.error = "";

    try {
      const user = await api.post<User>("/users", { name: this.name, email: this.email });
      this.dispatchEvent(new CustomEvent<User>("created", { detail: user, bubbles: true }));
    } catch (err) {
      this.error = err instanceof HTTPError ? `HTTP ${err.status}` : "Could not create user";
    } finally {
      this.saving = false;
    }
  }

  render() {
    return html`
      <form @submit=${this.onSubmit}>
        <input
          .value=${this.name}
          required
          @input=${(event: InputEvent) => {
            this.name = (event.target as HTMLInputElement).value;
          }}
        />
        <input
          type="email"
          .value=${this.email}
          required
          @input=${(event: InputEvent) => {
            this.email = (event.target as HTMLInputElement).value;
          }}
        />
        <button type="submit" ?disabled=${this.saving}>
          ${this.saving ? "Saving…" : "Add user"}
        </button>
        ${this.error ? html`<p>${this.error}</p>` : null}
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "create-user": CreateUser;
  }
}
