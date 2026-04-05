import { EventKey, EventMap } from '@tiny-event-bus/core';

export type MiddlewarePayload<T extends EventMap> = {
  [K in EventKey<T>]: { event: K; data: T[K] };
}[EventKey<T>];

export type Middleware<T extends EventMap> = (
  payload: MiddlewarePayload<T>,
  next: (payload: MiddlewarePayload<T>) => void,
) => void;
