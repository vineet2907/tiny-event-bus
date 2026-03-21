# @tiny-event-bus/core

[![npm version](https://img.shields.io/npm/v/@tiny-event-bus/core)](https://www.npmjs.com/package/@tiny-event-bus/core)

Zero-dependency, TypeScript-first event bus. Framework-agnostic core. ~633 B gzipped.

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

// Subscribe — returns an unsubscribe function
const unsub = bus.on('toast:show', (data) => {
  console.log(data.message); // fully typed
});

// Emit
bus.emit('toast:show', { message: 'Saved!', severity: 'info' });

// Unsubscribe
unsub();
```

## API

| Method                      | Description                                                                       |
| --------------------------- | --------------------------------------------------------------------------------- |
| `createEventBus<T>()`       | Factory — returns a new `EventBus<T>` instance                                    |
| `bus.on(event, handler)`    | Subscribe. Returns an `Unsubscribe` function                                      |
| `bus.once(event, handler)`  | Subscribe for a single emit, then auto-unsubscribe                                |
| `bus.emit(event, data)`     | Fire event to all current subscribers                                             |
| `bus.clear(event?)`         | Remove listeners for one event, or all                                            |
| `bus.hasListeners(event)`   | Returns `true` if `event` has at least one subscriber                             |
| `bus.listenerCount(event?)` | Number of handlers for `event`, or total across all events if omitted             |
| `bus.eventNames()`          | Array of event keys that currently have listeners                                 |
| `bus.onAny(handler)`        | Subscribe to all events. Handler receives `(event, data)`. Returns `Unsubscribe`. |

### `once` — one-time subscription

```ts
bus.once('shortcut:save', () => {
  console.log('Fired once, then auto-unsubscribed');
});
```

### `onAny` — catch-all listener

```ts
const unsub = bus.onAny((event, data) => {
  console.log(`[${String(event)}]`, data); // logs every event
});
```

### Introspection

```ts
bus.hasListeners('toast:show'); // true/false
bus.listenerCount('toast:show'); // number of handlers for this event
bus.listenerCount(); // total across all events (includes onAny)
bus.eventNames(); // ['toast:show', ...]
```

### `clear` — remove listeners

```ts
bus.clear('toast:show'); // remove all handlers for one event
bus.clear(); // remove all handlers for all events + onAny
```

## Design Notes

- **Fault isolation**: each handler is wrapped in try/catch — one bad handler can't break others
- **Safe mid-emit mutation**: `emit()` snapshots the handler Set before iterating
- **No duplicate handlers**: `Set` storage prevents registering the same function twice
- **Hygienic cleanup**: empty Sets are removed from the Map on unsubscribe
- **No state storage**: no `getState`, no replay — pure fire-and-forget

## License

MIT
