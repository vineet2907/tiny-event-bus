import React, { createContext, useContext } from 'react';
import type { EventMap, EventHandler, AnyEventHandler, EventBus } from '@tiny-event-bus/core';
import { useEvent as useEventBase } from './use-event.js';
import { useEventBus as useEventBusBase } from './use-event-bus.js';
import { useAnyEvent as useAnyEventBase } from './use-any-event.js';

export function createBusContext<T extends EventMap>() {
  const Ctx = createContext<EventBus<T> | null>(null);

  function useBus(): EventBus<T> {
    const bus = useContext(Ctx);
    if (!bus) {
      throw new Error('useBus must be used within a <Provider>');
    }
    return bus;
  }

  function Provider({ bus, children }: { bus: EventBus<T>; children: React.ReactNode }) {
    return React.createElement(Ctx.Provider, { value: bus }, children);
  }

  function useEvent<K extends keyof T & string>(event: K, handler: EventHandler<T[K]>) {
    return useEventBase(event, handler, useBus());
  }

  function useEventBus() {
    return useEventBusBase(useBus());
  }

  function useAnyEvent(handler: AnyEventHandler<T>) {
    return useAnyEventBase(handler, useBus());
  }

  return { Provider, useEvent, useEventBus, useAnyEvent };
}
