import type { EventMap, EventKey, EventHandler, AnyEventHandler, Unsubscribe, IEventBus } from '@tiny-event-bus/core';

export type MiddlewarePayload<T extends EventMap> = {
  [K in EventKey<T>]: { event: K; data: T[K] };
}[EventKey<T>];

export type Middleware<T extends EventMap> = (
  payload: MiddlewarePayload<T>,
  next: (payload: MiddlewarePayload<T>) => void,
) => void;

export function withMiddleware<T extends EventMap>(bus: IEventBus<T>, middlewares: Middleware<T>[] = []) {
  function runChain<K extends EventKey<T>>(event: K, data: T[K]): void {
    let index = 0;
    const next = (payload: MiddlewarePayload<T>) => {
      if (payload.event !== event) {
        throw new Error(
          `[middleware] Cannot change event name. Expected "${event}", got "${payload.event}".`,
        );
      }
      const mw = middlewares[index++];
      if (mw) {
        // TODO: wrap in try/catch for fault isolation (milestone 53)
        mw(payload, next);
      } else {
        bus.emit(payload.event as K, payload.data as T[K]);
      }
    };
    next({ event, data });
  }

  return {
    on<K extends EventKey<T>>(event: K, handler: EventHandler<T[K]>): Unsubscribe {
      return bus.on(event, handler);
    },
    once<K extends EventKey<T>>(event: K, handler: EventHandler<T[K]>): Unsubscribe {
      return bus.once(event, handler);
    },
    emit<K extends EventKey<T>>(event: K, data: T[K]): void {
      runChain(event, data);
    },
    clear<K extends EventKey<T>>(event?: K): void {
      bus.clear(event);
    },
    hasListeners<K extends EventKey<T>>(event: K): boolean {
      return bus.hasListeners(event);
    },
    listenerCount<K extends EventKey<T>>(event?: K): number {
      return bus.listenerCount(event);
    },
    eventNames(): EventKey<T>[] {
      return bus.eventNames();
    },
    onAny(handler: AnyEventHandler<T>): Unsubscribe {
      return bus.onAny(handler);
    },
    // TODO: add use(middleware) for runtime middleware addition (milestone 54)
  };
}
