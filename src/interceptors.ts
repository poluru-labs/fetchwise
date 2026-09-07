export type Interceptor<T> = (value: T) => T | Promise<T>;

interface Handler<T> {
  fulfilled: Interceptor<T>;
}

export class InterceptorManager<T> {
  private handlers: Array<Handler<T> | null> = [];

  use(fulfilled: Interceptor<T>): number {
    this.handlers.push({ fulfilled });
    return this.handlers.length - 1;
  }

  eject(id: number): void {
    this.handlers[id] = null;
  }

  clear(): void {
    this.handlers = [];
  }

  async run(value: T): Promise<T> {
    let current = value;

    for (const handler of this.handlers) {
      if (!handler) continue;
      current = await handler.fulfilled(current);
    }

    return current;
  }
}
