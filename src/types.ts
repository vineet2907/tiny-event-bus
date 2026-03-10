export type EventMap = Record<string, any>;

export type EventHandler<T = any> = (data: T) => void;

export type AnyEventHandler<T extends EventMap> = (event: keyof T, data: T[keyof T]) => void;

export type Unsubscribe = () => void;

export interface IEventBus<T extends EventMap> {
  on<K extends keyof T>(event: K, handler: EventHandler<T[K]>): Unsubscribe;
  once<K extends keyof T>(event: K, handler: EventHandler<T[K]>): Unsubscribe;
  emit<K extends keyof T>(event: K, data: T[K]): void;
  clear<K extends keyof T>(event?: K): void;
  hasListeners<K extends keyof T>(event: K): boolean;
  listenerCount<K extends keyof T>(event?: K): number;
  eventNames(): (keyof T)[];
  onAny(handler: AnyEventHandler<T>): Unsubscribe;
}
