import { useEffect, useRef } from 'react';
import type { EventMap, AnyEventHandler, IEventBus } from '@tiny-event-bus/core';

export function useAnyEvent<T extends EventMap>(
  handler: AnyEventHandler<T>,
  bus: IEventBus<T>,
): void {
  const handlerRef = useRef<AnyEventHandler<T>>(handler);
  handlerRef.current = handler;

  useEffect(() => {
    return bus.onAny(((event: keyof T, data: T[keyof T]) => {
      handlerRef.current(event, data);
    }) as AnyEventHandler<T>);
  }, [bus]);
}
