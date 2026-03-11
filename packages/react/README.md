# @tiny-event-bus/react

React hooks plugin for [@tiny-event-bus/core](https://www.npmjs.com/package/@tiny-event-bus/core). ~623 B gzipped.

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
  useEvent('toast:show', (data) => {
    console.log(data.message); // fully typed, auto-cleanup on unmount
  }, bus);
  return null;
}

function EmitButton() {
  const { emit } = useEventBus(bus);
  return <button onClick={() => emit('toast:show', { message: 'Hi!', severity: 'info' })}>Show Toast</button>;
}
```

## API

| Hook | Description |
|------|-------------|
| `useEvent(event, handler, bus)` | Subscribe with auto-cleanup on unmount. Uses `useRef` internally so handler updates never cause re-subscription. |
| `useEventBus(bus)` | Returns `{ emit, on, once }` with stable refs via `useCallback`. Safe to pass as props or use in dependency arrays. |
| `useAnyEvent(handler, bus)` | Subscribe to all events with auto-cleanup. Uses `useRef` for handler stability. |
| `createBusContext<T>()` | Factory — returns `{ Provider, useEvent, useEventBus, useAnyEvent }`. Hooks read bus from context (no bus arg needed). |

### `useEvent` — subscribe to a single event

```tsx
function ToastListener() {
  useEvent('toast:show', (data) => {
    showToast(data.message);
  }, bus);
  return null;
}
```

Handler is stored in a `useRef` — updating the handler function doesn't cause re-subscription. Cleanup runs automatically on unmount.

### `useEventBus` — emit and subscribe with stable refs

```tsx
function ActionBar() {
  const { emit, on, once } = useEventBus(bus);

  return <button onClick={() => emit('toast:show', { message: 'Hi!', severity: 'info' })}>Toast</button>;
}
```

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

const {
  Provider,
  useEvent,
  useEventBus,
  useAnyEvent,
} = createBusContext<ChatEvents>();

// Provide a bus instance at the top
function ChatRoot() {
  const bus = createEventBus<ChatEvents>();
  return <Provider bus={bus}><ChatMessages /></Provider>;
}

// Hooks read bus from context — no bus arg needed
function ChatMessages() {
  useEvent('message:new', (data) => console.log(data.text));
  return null;
}
```

Throws if hooks are used outside a `<Provider>`. Each `createBusContext()` call produces an isolated context — multiple scopes can coexist.

## License

MIT
