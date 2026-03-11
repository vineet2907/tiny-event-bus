# @tiny-event-bus/core

Zero-dependency, TypeScript-first event bus. Framework-agnostic core.

## Install

```bash
npm install @tiny-event-bus/core
```

## Quick Start

```ts
import { createEventBus } from '@tiny-event-bus/core';

type AppEvents = {
  'toast:show': { message: string; severity: 'info' | 'error' };
  'shortcut:save': void;
};

const bus = createEventBus<AppEvents>();

const unsub = bus.on('toast:show', (data) => {
  console.log(data.message); // fully typed
});

bus.emit('toast:show', { message: 'Saved!', severity: 'info' });

unsub(); // clean up
```

## API

| Method | Description |
|--------|-------------|
| `createEventBus<T>()` | Factory — returns a new `EventBus<T>` instance |
| `bus.on(event, handler)` | Subscribe. Returns an `Unsubscribe` function |
| `bus.once(event, handler)` | Subscribe for a single emit, then auto-unsubscribe |
| `bus.emit(event, data)` | Fire event to all current subscribers |
| `bus.clear(event?)` | Remove listeners for one event, or all |
| `bus.hasListeners(event)` | Returns `true` if `event` has at least one subscriber |
| `bus.listenerCount(event?)` | Number of handlers for `event`, or total across all events if omitted |
| `bus.eventNames()` | Array of event keys that currently have listeners |
| `bus.onAny(handler)` | Subscribe to all events. Handler receives `(event, data)`. Returns `Unsubscribe`. |

## Plugins

This is the core package. For React hooks support, install [`@tiny-event-bus/react`](https://www.npmjs.com/package/@tiny-event-bus/react).

## License

MIT
