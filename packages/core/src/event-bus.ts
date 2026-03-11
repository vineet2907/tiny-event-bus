import type { EventMap, EventHandler, AnyEventHandler, Unsubscribe, IEventBus } from './types.js';

export class EventBus<T extends EventMap> implements IEventBus<T> {
  private listeners = new Map<keyof T, Set<EventHandler>>();
  private anyListeners = new Set<AnyEventHandler<T>>();

  on<K extends keyof T>(event: K, handler: EventHandler<T[K]>): Unsubscribe {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    return () => {
      const set = this.listeners.get(event);
      set?.delete(handler);
      if (set?.size === 0) this.listeners.delete(event);
    };
  }

  once<K extends keyof T>(event: K, handler: EventHandler<T[K]>): Unsubscribe {
    const unsub = this.on(event, ((data: T[K]) => {
      unsub();
      handler(data);
    }) as EventHandler<T[K]>);
    return unsub;
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      for (const handler of [...handlers]) {
        try {
          handler(data);
        } catch {
          // fault isolation: one bad handler must not break others
        }
      }
    }
    for (const handler of [...this.anyListeners]) {
      try {
        handler(event, data);
      } catch {
        // fault isolation
      }
    }
  }

  clear<K extends keyof T>(event?: K): void {
    if (event !== undefined) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
      this.anyListeners.clear();
    }
  }

  hasListeners<K extends keyof T>(event: K): boolean {
    return (this.listeners.get(event)?.size ?? 0) > 0;
  }

  listenerCount<K extends keyof T>(event?: K): number {
    if (event !== undefined) {
      return this.listeners.get(event)?.size ?? 0;
    }
    let total = this.anyListeners.size;
    for (const set of this.listeners.values()) {
      total += set.size;
    }
    return total;
  }

  eventNames(): (keyof T)[] {
    return [...this.listeners.keys()];
  }

  onAny(handler: AnyEventHandler<T>): Unsubscribe {
    this.anyListeners.add(handler);
    return () => {
      this.anyListeners.delete(handler);
    };
  }
}

export function createEventBus<T extends EventMap>(): EventBus<T> {
  return new EventBus<T>();
}