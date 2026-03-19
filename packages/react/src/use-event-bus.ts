import { useMemo } from 'react';
import type { EventMap, IEventBus } from '@tiny-event-bus/core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

export type BusMethods<B> = {
  [K in keyof B as B[K] extends AnyFunction ? K : never]: B[K];
};

export function useEventBus<B extends IEventBus<EventMap>>(
  bus: B,
): BusMethods<B> {
  return useMemo(() => {
    const source = bus as Record<string, unknown>;
    const methods: Record<string, unknown> = {};

    for (const key of Object.keys(source)) {
      const fn = source[key];
      if (typeof fn === 'function') {
        methods[key] = (...args: unknown[]) =>
          (fn as AnyFunction).apply(bus, args);
      }
    }

    return methods as BusMethods<B>;
  }, [bus]);
}
