import type { EventMap, IEventBus } from '@tiny-event-bus/core';

export interface ReplayEntry<T extends EventMap> {
  event: keyof T;
  data: T[keyof T];
  timestamp: number;
}

export interface ReplayOptions {
  maxSize?: number;
  autoReplay?: boolean;
}

export interface ReplayBus<T extends EventMap> extends IEventBus<T> {
  getHistory<K extends keyof T>(event?: K): ReplayEntry<T>[];
  clearHistory<K extends keyof T>(event?: K): void;
}
