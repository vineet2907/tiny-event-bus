# tiny-event-bus

Zero-dependency, TypeScript-first event bus for React component communication.

> Framework-agnostic core + thin React hook layer.

## Features

- **Type-safe** — full generic support, catch errors at compile time
- **Zero runtime deps** — core has no dependencies at all
- **React hooks** — `useEvent` and `useEventBus` with automatic cleanup
- **Fault-isolated** — one bad handler can't break others
- **Tiny** — core ~450 B, with React hooks ~640 B (min+gzip)

## Install

```bash
npm install tiny-event-bus
```

## Quick Start

```ts
import { createEventBus } from 'tiny-event-bus';
import { useEvent, useEventBus } from 'tiny-event-bus/react';

// 1. Define your event map
type AppEvents = {
  'toast:show': { message: string; severity: 'info' | 'error' };
  'shortcut:save': void;
};

// 2. Create a bus (you own the instance)
const bus = createEventBus<AppEvents>();

// 3. Emit from anywhere
bus.emit('toast:show', { message: 'Saved!', severity: 'info' });

// 4. Subscribe in React components
function ToastListener() {
  useEvent('toast:show', (data) => {
    console.log(data.message); // fully typed
  }, bus);
  return null;
}
```

## API

### Core

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

### React Hooks

| Hook | Description |
|------|-------------|
| `useEvent(event, handler, bus)` | Subscribe with auto-cleanup on unmount. Uses `useRef` internally so handler updates never cause re-subscription. |
| `useEventBus(bus)` | Returns `{ emit, on, once }` with stable refs via `useCallback`. Safe to pass as props or use in dependency arrays. |

## When to Use (vs React State)

| Use event bus | Use React state |
|---------------|-----------------|
| Fire-and-forget signals (toasts, analytics, shortcuts) | UI data that drives rendering |
| Cross-module notifications | Component-local data |
| No re-renders needed | Must trigger re-render |

**Rule of thumb**: if a component needs to *render* data, use React state. If something needs to *react to a signal*, use the event bus.

## Example App

A full shopping cart demo lives in `examples/react/` — shows state vs event bus side by side. See [examples/react/README.md](examples/react/README.md) for details.

```bash
npm run example   # or: cd examples/react && npm install && npm run dev
```

## Development

```bash
npm test          # run tests
npm run build     # build ESM + CJS to dist/
npm run typecheck # tsc --noEmit
```

## License

MIT
