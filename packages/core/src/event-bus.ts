import type {
  EventMap,
  EventKey,
  EventHandler,
  AnyEventHandler,
  Unsubscribe,
  IEventBus,
} from './types.js';

export function createEventBus<T extends EventMap>(): IEventBus<T> {
  const listeners = new Map<EventKey<T>, Set<EventHandler>>();
  const anyListeners = new Set<AnyEventHandler<T>>();

  const bus: IEventBus<T> = {
    on<K extends EventKey<T>>(
      event: K,
      handler: EventHandler<T[K]>,
    ): Unsubscribe {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)!.add(handler);

      return () => {
        const set = listeners.get(event);
        set?.delete(handler);
        if (set?.size === 0) listeners.delete(event);
      };
    },

    once<K extends EventKey<T>>(
      event: K,
      handler: EventHandler<T[K]>,
    ): Unsubscribe {
      const unsub = bus.on(event, ((data: T[K]) => {
        unsub();
        handler(data);
      }) as EventHandler<T[K]>);
      return unsub;
    },

    emit<K extends EventKey<T>>(event: K, data: T[K]): void {
      const handlers = listeners.get(event);
      if (handlers) {
        for (const handler of [...handlers]) {
          try {
            handler(data);
          } catch {
            // fault isolation: one bad handler must not break others
          }
        }
      }
      for (const handler of [...anyListeners]) {
        try {
          handler(event, data);
        } catch {
          // fault isolation
        }
      }
    },

    clear<K extends EventKey<T>>(event?: K): void {
      if (event !== undefined) {
        listeners.delete(event);
      } else {
        listeners.clear();
        anyListeners.clear();
      }
    },

    hasListeners<K extends EventKey<T>>(event: K): boolean {
      return (listeners.get(event)?.size ?? 0) > 0;
    },

    listenerCount<K extends EventKey<T>>(event?: K): number {
      if (event !== undefined) {
        return listeners.get(event)?.size ?? 0;
      }
      let total = anyListeners.size;
      for (const set of listeners.values()) {
        total += set.size;
      }
      return total;
    },

    eventNames(): EventKey<T>[] {
      return [...listeners.keys()];
    },

    onAny(handler: AnyEventHandler<T>): Unsubscribe {
      anyListeners.add(handler);
      return () => {
        anyListeners.delete(handler);
      };
    },
  };

  return bus;
}
