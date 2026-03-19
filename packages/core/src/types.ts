// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventMap = Record<string, any>;

export type EventKey<T extends EventMap> = keyof T & string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventHandler<T = any> = (data: T) => void;

export type AnyEventHandler<T extends EventMap> = (
  event: EventKey<T>,
  data: T[EventKey<T>],
) => void;

export type Unsubscribe = () => void;

export interface IEventBus<T extends EventMap> {
  on<K extends EventKey<T>>(event: K, handler: EventHandler<T[K]>): Unsubscribe;
  once<K extends EventKey<T>>(
    event: K,
    handler: EventHandler<T[K]>,
  ): Unsubscribe;
  emit<K extends EventKey<T>>(event: K, data: T[K]): void;
  clear<K extends EventKey<T>>(event?: K): void;
  hasListeners<K extends EventKey<T>>(event: K): boolean;
  listenerCount<K extends EventKey<T>>(event?: K): number;
  eventNames(): EventKey<T>[];
  onAny(handler: AnyEventHandler<T>): Unsubscribe;
}
