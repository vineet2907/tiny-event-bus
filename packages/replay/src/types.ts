import type { EventMap, EventKey, IEventBus } from '@tiny-event-bus/core';

export interface ReplayEntry<T extends EventMap> {
  event: EventKey<T>;
  data: T[EventKey<T>];
  timestamp: number;
}

export interface ReplayOptions {
  maxSize?: number;
  autoReplay?: boolean;
}

export interface ReplayBus<T extends EventMap> extends IEventBus<T> {
  getHistory<K extends EventKey<T>>(event?: K): ReplayEntry<T>[];
  clearHistory<K extends EventKey<T>>(event?: K): void;
}
