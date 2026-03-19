import type {
  EventMap,
  EventHandler,
  AnyEventHandler,
  Unsubscribe,
  IEventBus,
} from '@tiny-event-bus/core';
import type { ReplayBus, ReplayOptions, ReplayEntry } from './types.js';

const DEFAULT_MAX_SIZE = 50;

export function withReplay<T extends EventMap>(
  bus: IEventBus<T>,
  options?: ReplayOptions,
): ReplayBus<T> {
  const maxSize = options?.maxSize ?? DEFAULT_MAX_SIZE;
  const buffer: ReplayEntry<T>[] = [];

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
      buffer.push({ event, data, timestamp: Date.now() });
      if (buffer.length > maxSize) buffer.shift();
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
      return [...buffer];
    },
    clearHistory(): void {
      buffer.length = 0;
    },
  };
}
