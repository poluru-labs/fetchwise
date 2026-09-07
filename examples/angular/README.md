# Angular

Industry pattern: a root `ApiService`, standalone components, and signals.

```
angular/
  api.service.ts           providedIn: 'root'
  users.component.ts       OnInit / OnDestroy + AbortController
  users.component.html     @if / @for
  create-user.component.ts POST mutation
```

Works in Angular 17+. After `npm install @poluru-labs/fetchwise`:

```ts
import { bootstrapApplication } from "@angular/platform-browser";
import { UsersComponent } from "./users.component";

bootstrapApplication(UsersComponent);
```
