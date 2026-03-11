import { useCallback } from 'react';
import type { EventMap, EventHandler, Unsubscribe, EventBus } from '@tiny-event-bus/core';

export interface BusActions<T extends EventMap> {
  emit: <K extends keyof T & string>(event: K, data: T[K]) => void;
  on: <K extends keyof T & string>(event: K, handler: EventHandler<T[K]>) => Unsubscribe;
  once: <K extends keyof T & string>(event: K, handler: EventHandler<T[K]>) => Unsubscribe;
}

export function useEventBus<T extends EventMap>(bus: EventBus<T>): BusActions<T> {
  const emit = useCallback(<K extends keyof T & string>(event: K, data: T[K]) => {
    bus.emit(event, data);
  }, [bus]);

  const on = useCallback(<K extends keyof T & string>(event: K, handler: EventHandler<T[K]>) => {
    return bus.on(event, handler);
  }, [bus]);

  const once = useCallback(<K extends keyof T & string>(event: K, handler: EventHandler<T[K]>) => {
    return bus.once(event, handler);
  }, [bus]);

  return { emit, on, once };
}
