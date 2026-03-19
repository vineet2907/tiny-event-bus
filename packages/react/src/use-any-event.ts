import { useEffect, useRef } from 'react';
import type {
  EventMap,
  EventKey,
  AnyEventHandler,
  IEventBus,
} from '@tiny-event-bus/core';

export function useAnyEvent<T extends EventMap>(
  handler: AnyEventHandler<T>,
  bus: IEventBus<T>,
): void {
  const handlerRef = useRef<AnyEventHandler<T>>(handler);
  // Assign during render to avoid stale closure between render and effect.
  // eslint-disable-next-line react-hooks/refs
  handlerRef.current = handler;

  useEffect(() => {
    return bus.onAny(((event: EventKey<T>, data: T[EventKey<T>]) => {
      handlerRef.current(event, data);
    }) as AnyEventHandler<T>);
  }, [bus]);
}
