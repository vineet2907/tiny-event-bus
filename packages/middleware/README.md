# @tiny-event-bus/middleware

Middleware plugin for [`@tiny-event-bus/core`](../core/README.md). Intercepts `emit()` calls and pipes them through a composable chain of middleware functions.

## Install

```bash
npm install @tiny-event-bus/core @tiny-event-bus/middleware
```

## Quick Start

```ts
import { createEventBus } from '@tiny-event-bus/core';
import { withMiddleware, type Middleware } from '@tiny-event-bus/middleware';

type AppEvents = {
  'toast:show': { message: string; severity: 'info' | 'success' | 'error' };
};

const toastFormatter: Middleware<AppEvents> = (payload, next) => {
  if (payload.event === 'toast:show') {
    const { event, data } = payload;
    const icon = { success: '✅', info: 'ℹ️', error: '❌' }[data.severity];
    next({ event, data: { ...data, message: `${icon} ${data.message}` } });
  } else {
    next(payload);
  }
};

const bus = withMiddleware(createEventBus<AppEvents>(), [toastFormatter]);

bus.on('toast:show', ({ message }) => console.log(message));
bus.emit('toast:show', { message: 'Saved!', severity: 'success' });
// logs: "✅ Saved!"
```

## API

### `withMiddleware(bus, middlewares?)`

Wraps an `IEventBus<T>` and returns a `MiddlewareBus<T>`. All `emit()` calls pass through the middleware chain before reaching handlers. All other methods delegate to the inner bus unchanged.

### Middleware function

```ts
type Middleware<T> = (
  payload: MiddlewarePayload<T>,  // discriminated union — narrowing event narrows data
  next: (payload: MiddlewarePayload<T>) => void,
) => void;
```

The payload is a discriminated union — narrowing `event` automatically narrows `data` to the correct type, with no manual casting required.

- **Always call `next({ event, data })`** to continue the chain. If you don't, the pipeline short-circuits — no further middleware runs and the event is never emitted to handlers.
- To intentionally block an event, return without calling `next`.
- Passing a different event name to `next` throws a runtime error — event names are immutable for the lifetime of the chain.
- Errors thrown inside middleware are swallowed; the chain stops at that point.

### `bus.use(middleware)` → `Unsubscribe`

<!-- TODO: implement use() in milestone 54 -->

Add middleware at runtime. Returns an unsubscribe function to remove it.

```ts
const stop = bus.use((payload, next) => {
  console.log(payload.event, payload.data);
  next(payload);
});

stop(); // remove
```
