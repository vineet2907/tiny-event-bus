# @tiny-event-bus/react

React hooks plugin for [@tiny-event-bus/core](https://www.npmjs.com/package/@tiny-event-bus/core).

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
    console.log(data.message); // fully typed
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
| `useEvent(event, handler, bus)` | Subscribe with auto-cleanup on unmount |
| `useEventBus(bus)` | Returns `{ emit, on, once }` with stable refs |
| `useAnyEvent(handler, bus)` | Subscribe to all events with auto-cleanup |
| `createBusContext<T>()` | Factory returning `{ Provider, useEvent, useEventBus, useAnyEvent }` |

## License

MIT
