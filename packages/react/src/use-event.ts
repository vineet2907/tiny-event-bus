import { useEffect, useRef } from 'react';
import type { EventMap, EventHandler, EventBus } from '@tiny-event-bus/core';

export function useEvent<T extends EventMap, K extends keyof T & string>(
  event: K,
  handler: EventHandler<T[K]>,
  bus: EventBus<T>,
): void {
  const handlerRef = useRef<EventHandler<T[K]>>(handler);
  handlerRef.current = handler;

  useEffect(() => {
    return bus.on(event, ((data: T[K]) => {
      handlerRef.current(data);
    }) as EventHandler<T[K]>);
  }, [bus, event]);
}