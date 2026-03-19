import { useMemo } from 'react';
import type { IEventBus } from '@tiny-event-bus/core';

export type BusMethods<B> = {
  [K in keyof B as B[K] extends (...args: any[]) => any ? K : never]: B[K];
};

export function useEventBus<B extends IEventBus<any>>(bus: B): BusMethods<B> {
  return useMemo(() => {
    const source = bus as Record<string, unknown>;
    const methods: Record<string, unknown> = {};

    for (const key of Object.keys(source)) {
      const fn = source[key];
      if (typeof fn === 'function') {
        methods[key] = (...args: unknown[]) =>
          (fn as Function).apply(bus, args);
      }
    }

    return methods as BusMethods<B>;
  }, [bus]);
}
