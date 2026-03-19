import type {
  EventMap,
  EventHandler,
  AnyEventHandler,
  Unsubscribe,
  IEventBus,
} from '@tiny-event-bus/core';
import type { ReplayBus, ReplayOptions, ReplayEntry } from './types.js';

export function withReplay<T extends EventMap>(
  bus: IEventBus<T>,
  _options?: ReplayOptions,
): ReplayBus<T> {
  return {
    on<K extends keyof T>(
      event: K,
      handler: EventHandler<T[K]>,
    ): Unsubscribe {
      return bus.on(event, handler);
    },
    once<K extends keyof T>(
      event: K,
      handler: EventHandler<T[K]>,
    ): Unsubscribe {
      return bus.once(event, handler);
    },
    emit<K extends keyof T>(event: K, data: T[K]): void {
      bus.emit(event, data);
    },
    clear<K extends keyof T>(event?: K): void {
      bus.clear(event);
    },
    hasListeners<K extends keyof T>(event: K): boolean {
      return bus.hasListeners(event);
    },
    listenerCount<K extends keyof T>(event?: K): number {
      return bus.listenerCount(event);
    },
    eventNames(): (keyof T)[] {
      return bus.eventNames();
    },
    onAny(handler: AnyEventHandler<T>): Unsubscribe {
      return bus.onAny(handler);
    },
    getHistory(): ReplayEntry<T>[] {
      return [];
    },
    clearHistory(): void {
      // stub — buffering implemented in milestone 40
    },
  };
}
