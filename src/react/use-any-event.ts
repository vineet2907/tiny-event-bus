import { useEffect, useRef } from 'react';
import type { EventMap, AnyEventHandler } from '../types.js';
import type { EventBus } from '../event-bus.js';

export function useAnyEvent<T extends EventMap>(
  handler: AnyEventHandler<T>,
  bus: EventBus<T>,
): void {
  const handlerRef = useRef<AnyEventHandler<T>>(handler);
  handlerRef.current = handler;

  useEffect(() => {
    return bus.onAny(((event: keyof T, data: T[keyof T]) => {
      handlerRef.current(event, data);
    }) as AnyEventHandler<T>);
  }, [bus]);
}
