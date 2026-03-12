import { useEffect, useRef } from 'react';
import type { EventMap, EventHandler, IEventBus } from '@tiny-event-bus/core';

export function useEvent<T extends EventMap, K extends keyof T & string>(
  event: K,
  handler: EventHandler<T[K]>,
  bus: IEventBus<T>,
): void {
  const handlerRef = useRef<EventHandler<T[K]>>(handler);
  // Assign during render to avoid stale closure between render and effect.
  // eslint-disable-next-line react-hooks/refs
  handlerRef.current = handler;

  useEffect(() => {
    return bus.on(event, ((data: T[K]) => {
      handlerRef.current(data);
    }) as EventHandler<T[K]>);
  }, [bus, event]);
}
