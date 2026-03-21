# @tiny-event-bus/react

[![npm version](https://img.shields.io/npm/v/@tiny-event-bus/react)](https://www.npmjs.com/package/@tiny-event-bus/react)

React hooks plugin for `@tiny-event-bus/core`. ~915 B gzipped.

Requires React >=17 and `@tiny-event-bus/core` as peer dependencies.

## Install

```bash
npm install @tiny-event-bus/core @tiny-event-bus/react
```

## Quick Start

```tsx
import { createEventBus } from '@tiny-event-bus/core';
import { useEvent, useEventBus } from '@tiny-event-bus/react';

type AppEvents = {
  'toast:show': { message: string; severity: 'info' | 'error' };
};

const bus = createEventBus<AppEvents>();

function ToastListener() {
  useEvent(
    'toast:show',
    (data) => {
      console.log(data.message); // fully typed, auto-cleanup on unmount
    },
    bus,
  );
  return null;
}

function EmitButton() {
  const { emit } = useEventBus(bus);
  return (
    <button
      onClick={() => emit('toast:show', { message: 'Hi!', severity: 'info' })}
    >
      Show Toast
    </button>
  );
}
```

## API

| Hook                            | Description                                                                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `useEvent(event, handler, bus)` | Subscribe with auto-cleanup on unmount. Uses `useRef` internally so handler updates never cause re-subscription.               |
| `useEventBus(bus)`              | Returns `BusMethods<B>` — all function-valued properties of the bus with stable refs via `useMemo`. Works with any bus object. |
| `useAnyEvent(handler, bus)`     | Subscribe to all events with auto-cleanup. Uses `useRef` for handler stability.                                                |
| `createBusContext<T>()`         | Factory — returns `{ Provider, useEvent, useEventBus, useAnyEvent }`. Hooks read bus from context (no bus arg needed).         |

### `useEvent` — subscribe to a single event

```tsx
function ToastListener() {
  useEvent(
    'toast:show',
    (data) => {
      showToast(data.message);
    },
    bus,
  );
  return null;
}
```

Handler is stored in a `useRef` — updating the handler function doesn't cause re-subscription. Cleanup runs automatically on unmount.

### `useEventBus` — emit, subscribe, and clear with stable refs

```tsx
function ActionBar() {
  const { emit, on, once, clear } = useEventBus(bus);

  return (
    <button
      onClick={() => emit('toast:show', { message: 'Hi!', severity: 'info' })}
    >
      Toast
    </button>
  );
}
```

Returns `BusMethods<B>` — a mapped type that exposes every function-valued property on the bus object. This means it works with plain buses _and_ decorated buses like `ReplayBus`:

```tsx
import { withReplay } from '@tiny-event-bus/replay';

const replayBus = withReplay(createEventBus<AppEvents>());

function Component() {
  // getHistory and clearHistory are also available
  const { emit, getHistory, clearHistory } = useEventBus(replayBus);
}
```

`clear()` removes all listeners. `clear(event)` removes only that event's listeners.

### `useAnyEvent` — catch-all hook

```tsx
function AnalyticsLogger() {
  useAnyEvent((event, data) => {
    analytics.track(String(event), data);
  }, bus);
  return null;
}
```

### `createBusContext` — scoped context (no prop drilling)

```tsx
import { createEventBus } from '@tiny-event-bus/core';
import { createBusContext } from '@tiny-event-bus/react';

type ChatEvents = { 'message:new': { text: string } };

const { Provider, useEvent, useEventBus, useAnyEvent } =
  createBusContext<ChatEvents>();

// Provide a bus instance at the top
function ChatRoot() {
  const bus = createEventBus<ChatEvents>();
  return (
    <Provider bus={bus}>
      <ChatMessages />
    </Provider>
  );
}

// Hooks read bus from context — no bus arg needed
function ChatMessages() {
  useEvent('message:new', (data) => console.log(data.text));
  return null;
}
```

Throws if hooks are used outside a `<Provider>`. Each `createBusContext()` call produces an isolated context — multiple scopes can coexist.

## Using with `@tiny-event-bus/replay`

All hooks work seamlessly with `withReplay` decorated buses. Install the replay plugin alongside:

```bash
npm install @tiny-event-bus/replay
```

Wrap your bus with `withReplay` and pass it to hooks as usual:

```tsx
import { createEventBus } from '@tiny-event-bus/core';
import { withReplay } from '@tiny-event-bus/replay';
import { createBusContext } from '@tiny-event-bus/react';

type ActivityEvents = {
  'activity:log': { action: string; timestamp: number };
};

const activityBus = withReplay(createEventBus<ActivityEvents>(), {
  maxSize: 50,
});

const { Provider, useEvent, useEventBus, useAnyEvent } =
  createBusContext<ActivityEvents>();
```

Late-mounting components can replay buffered events on mount:

```tsx
function ActivityFeed() {
  const { getHistory } = useEventBus(activityBus);
  const [entries, setEntries] = useState<string[]>([]);

  useEffect(() => {
    // Seed from replay buffer
    setEntries(getHistory().map((e) => e.data.action));
  }, [getHistory]);

  // Live updates going forward
  useEvent(
    'activity:log',
    (data) => {
      setEntries((prev) => [...prev, data.action]);
    },
    activityBus,
  );

  return (
    <ul>
      {entries.map((e, i) => (
        <li key={i}>{e}</li>
      ))}
    </ul>
  );
}
```

`useEventBus` automatically discovers `getHistory` and `clearHistory` from the replay bus — no extra configuration needed.

## When to Use (vs React State)

| Use event bus                                          | Use React state               |
| ------------------------------------------------------ | ----------------------------- |
| Fire-and-forget signals (toasts, analytics, shortcuts) | UI data that drives rendering |
| Cross-module notifications                             | Component-local data          |
| No re-renders needed                                   | Must trigger re-render        |

**Rule of thumb**: if a component needs to _render_ data, use React state. If something needs to _react to a signal_, use the event bus.

## License

MIT
