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

const toastFormatter: Middleware<AppEvents> = (event, data, next) => {
  if (event === 'toast:show') {
    const icon = { success: '✅', info: 'ℹ️', error: '❌' }[data.severity];
    next(event, { ...data, message: `${icon} ${data.message}` });
  } else {
    next(event, data);
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
  event: EventKey<T>,
  data: T[EventKey<T>],
  next: MiddlewareNext<T>,
) => void;
```

- Call `next(event, data)` to continue — optionally with modified event name or payload.
- Return without calling `next` to block the event entirely.
- Errors thrown inside middleware are swallowed; the chain stops at that point.

### `bus.use(middleware)` → `Unsubscribe`

Add middleware at runtime. Returns an unsubscribe function to remove it.

```ts
const stop = bus.use((event, data, next) => {
  console.log(event, data);
  next(event, data);
});

stop(); // remove
```
