import { useCallback } from 'react';
import type { EventMap, EventHandler, Unsubscribe, IEventBus } from '@tiny-event-bus/core';

export interface BusActions<T extends EventMap> {
  emit: <K extends keyof T & string>(event: K, data: T[K]) => void;
  on: <K extends keyof T & string>(event: K, handler: EventHandler<T[K]>) => Unsubscribe;
  once: <K extends keyof T & string>(event: K, handler: EventHandler<T[K]>) => Unsubscribe;
  clear: <K extends keyof T & string>(event?: K) => void;
}

export function useEventBus<T extends EventMap>(bus: IEventBus<T>): BusActions<T> {
  const emit = useCallback(<K extends keyof T & string>(event: K, data: T[K]) =>
    bus.emit(event, data), [bus]);

  const on = useCallback(<K extends keyof T & string>(event: K, handler: EventHandler<T[K]>) =>
    bus.on(event, handler), [bus]);

  const once = useCallback(<K extends keyof T & string>(event: K, handler: EventHandler<T[K]>) =>
    bus.once(event, handler), [bus]);

  const clear = useCallback(<K extends keyof T & string>(event?: K) =>
    bus.clear(event), [bus]);

  return { emit, on, once, clear };
}
