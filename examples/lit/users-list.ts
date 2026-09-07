import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { HTTPError } from "@poluru-labs/fetchwise";
import { api, type User } from "./api.js";
import "./create-user.js";

@customElement("users-list")
export class UsersList extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: system-ui, sans-serif;
    }
    button {
      cursor: pointer;
    }
  `;

  @state() private users: User[] = [];
  @state() private error = "";
  @state() private loading = true;

  private controller = new AbortController();

  connectedCallback() {
    super.connectedCallback();
    void this.load();
  }

  disconnectedCallback() {
    this.controller.abort();
    super.disconnectedCallback();
  }

  private async load() {
    this.controller.abort();
    this.controller = new AbortController();
    this.loading = true;
    this.error = "";

    try {
      this.users = await api.get<User[]>("/users", { signal: this.controller.signal });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      this.error = err instanceof HTTPError ? `HTTP ${err.status}` : "Could not load users";
    } finally {
      this.loading = false;
    }
  }

  render() {
    if (this.loading) return html`<p>Loading users…</p>`;
    if (this.error) {
      return html`<p>${this.error} <button @click=${() => this.load()}>Retry</button></p>`;
    }
    if (!this.users.length) return html`<p>No users yet.</p>`;

    return html`
      <section>
        <h1>Users</h1>
        <ul>
          ${this.users.map((user) => html`<li>${user.name} — ${user.email}</li>`)}
        </ul>
        <create-user @created=${() => this.load()}></create-user>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "users-list": UsersList;
  }
}
