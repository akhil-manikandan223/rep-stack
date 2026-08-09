import { Signal, signal } from '@angular/core';

/**
 * In-memory CRUD store, one instance per entity. Method shapes mirror what an
 * HttpClient-backed service would expose, so swapping in a real backend later
 * only means replacing this class's internals, not its callers.
 */
export class EntityStore<T extends { id: string }> {
  private readonly items = signal<T[]>([]);

  readonly rows: Signal<T[]> = this.items;

  constructor(seed: T[]) {
    this.items.set(seed);
  }

  list(): T[] {
    return this.items();
  }

  get(id: string): T | undefined {
    return this.items().find((item) => item.id === id);
  }

  create(dto: Omit<T, 'id'>): T {
    const created = { ...dto, id: crypto.randomUUID() } as T;
    this.items.update((current) => [...current, created]);
    return created;
  }

  update(id: string, dto: Partial<T>): T {
    let updated: T | undefined;
    this.items.update((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        updated = { ...item, ...dto };
        return updated;
      }),
    );
    if (!updated) {
      throw new Error(`EntityStore.update: no item with id "${id}"`);
    }
    return updated;
  }

  remove(id: string): void {
    this.items.update((current) => current.filter((item) => item.id !== id));
  }
}
