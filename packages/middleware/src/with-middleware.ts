import type { EventMap, EventKey, EventHandler, AnyEventHandler, Unsubscribe, IEventBus } from '@tiny-event-bus/core';

export function withMiddleware<T extends EventMap>(bus: IEventBus<T>) {
  return {
    on<K extends EventKey<T>>(event: K, handler: EventHandler<T[K]>): Unsubscribe {
      return bus.on(event, handler);
    },
    once<K extends EventKey<T>>(event: K, handler: EventHandler<T[K]>): Unsubscribe {
      return bus.once(event, handler);
    },
    emit<K extends EventKey<T>>(event: K, data: T[K]): void {
      bus.emit(event, data);
    },
    clear<K extends EventKey<T>>(event?: K): void {
      bus.clear(event);
    },
    hasListeners<K extends EventKey<T>>(event: K): boolean {
      return bus.hasListeners(event);
    },
    listenerCount<K extends EventKey<T>>(event?: K): number {
      return bus.listenerCount(event);
    },
    eventNames(): EventKey<T>[] {
      return bus.eventNames();
    },
    onAny(handler: AnyEventHandler<T>): Unsubscribe {
      return bus.onAny(handler);
    },
  };
}
