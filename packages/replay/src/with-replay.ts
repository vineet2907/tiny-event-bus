import type {
  EventMap,
  EventHandler,
  AnyEventHandler,
  Unsubscribe,
  IEventBus,
} from '@tiny-event-bus/core';
import type { ReplayBus, ReplayOptions, ReplayEntry } from './types.js';

const DEFAULT_MAX_SIZE = 50;
const DEFAULT_AUTO_REPLAY = true;

export function withReplay<T extends EventMap>(
  bus: IEventBus<T>,
  options?: ReplayOptions,
): ReplayBus<T> {
  const maxSize = options?.maxSize ?? DEFAULT_MAX_SIZE;
  const autoReplay = options?.autoReplay ?? DEFAULT_AUTO_REPLAY;
  const buffer: ReplayEntry<T>[] = [];

  return {
    on<K extends keyof T>(
      event: K,
      handler: EventHandler<T[K]>,
    ): Unsubscribe {
      if (autoReplay) {
        for (const entry of buffer) {
          if (entry.event === event) {
            try {
              handler(entry.data as T[K]);
            } catch {
              // fault isolation during replay
            }
          }
        }
      }
      return bus.on(event, handler);
    },
    once<K extends keyof T>(
      event: K,
      handler: EventHandler<T[K]>,
    ): Unsubscribe {
      if (autoReplay) {
        const match = buffer.find((entry) => entry.event === event);
        if (match) {
          try {
            handler(match.data as T[K]);
          } catch {
            // fault isolation during replay
          }
          // once contract fulfilled by replay — no active subscription to tear down
          return () => {};
        }
      }
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
      if (autoReplay) {
        for (const entry of buffer) {
          try {
            handler(entry.event, entry.data);
          } catch {
            // fault isolation during replay
          }
        }
      }
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
