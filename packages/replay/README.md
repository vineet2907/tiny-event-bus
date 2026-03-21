# @tiny-event-bus/replay

[![npm version](https://img.shields.io/npm/v/@tiny-event-bus/replay)](https://www.npmjs.com/package/@tiny-event-bus/replay)

Event replay plugin for tiny-event-bus — buffer past events, auto-replay to late subscribers. ~764 B gzipped.

## Install

```bash
npm install @tiny-event-bus/replay @tiny-event-bus/core
```

## Quick Start

```ts
import { createEventBus } from '@tiny-event-bus/core';
import { withReplay } from '@tiny-event-bus/replay';

type AppEvents = {
  'toast:show': { message: string };
  'user:login': { userId: string };
};

const bus = withReplay(createEventBus<AppEvents>(), { maxSize: 50 });

// Emit events — buffered automatically
bus.emit('user:login', { userId: '123' });

// Late subscriber receives buffered events on subscribe
bus.on('user:login', (data) => {
  console.log(data.userId); // '123' — replayed immediately
});

// Inspect history
bus.getHistory(); // all buffered events
bus.getHistory('user:login'); // filtered by event type
bus.clearHistory(); // clear buffer
```

## API

| Method                      | Description                                         |
| --------------------------- | --------------------------------------------------- |
| `withReplay(bus, options?)` | Wrap an `IEventBus<T>` with replay capabilities     |
| `bus.getHistory(event?)`    | Get buffered events (all or filtered by event type) |
| `bus.clearHistory(event?)`  | Clear buffer (all or specific event type)           |

### Options

| Option       | Type      | Default | Description                                    |
| ------------ | --------- | ------- | ---------------------------------------------- |
| `maxSize`    | `number`  | `50`    | Maximum events to buffer (FIFO eviction)       |
| `autoReplay` | `boolean` | `true`  | Auto-replay buffered events to new subscribers |

All `IEventBus<T>` methods (`on`, `once`, `emit`, `clear`, etc.) work transparently.

## Design

- **Decorator pattern**: wraps `IEventBus<T>`, returns `ReplayBus<T>` extending the interface
- **Framework-agnostic**: no React/Vue dependency
- **Non-destructive**: does not modify the original bus
- **Fault-isolated**: replay errors in one handler don't break others

## License

MIT
