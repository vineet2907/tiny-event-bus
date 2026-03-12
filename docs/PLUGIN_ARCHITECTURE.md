# Plugin Architecture

> Design document for the tiny-event-bus plugin system. This describes conventions for future feature plugins (replay, devtools, etc.) and how they compose with framework plugins (React, Vue, etc.).

## Two Independent Axes

Feature plugins and framework plugins are **independent**. Both peer-depend on `@tiny-event-bus/core`. Neither depends on the other. They compose at the consumer level through the shared bus instance.

```
                    ┌──────────────────┐
                    │  @tiny-event-bus  │
                    │      /core        │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     Framework plugins    (peer dep)    Feature plugins
              │              │              │
    ┌─────────┴───┐          │     ┌────────┴────────┐
    │   /react    │          │     │    /replay      │
    │   /vue (*)  │          │     │    /devtools (*) │
    └─────────────┘          │     └─────────────────┘
                             │
                    ┌────────┴─────────┐
                    │   Consumer App    │
                    │  composes both    │
                    └──────────────────┘

  (*) = planned, not yet implemented
```

**Why this works**: Feature plugins operate on the bus instance directly (framework-agnostic). Framework plugins provide hooks/bindings to interact with the bus. A replay plugin wraps the bus — React hooks don't care because they accept any `IEventBus<T>` instance.

## Composition Pattern: Decorator

Feature plugins export a factory that wraps an `IEventBus<T>` instance:

```ts
// @tiny-event-bus/replay (hypothetical)
import type { IEventBus } from '@tiny-event-bus/core';

interface ReplayBus<T> extends IEventBus<T> {
  getHistory(): Array<{ event: keyof T; data: T[keyof T] }>;
  replay(): void;
  clearHistory(): void;
}

function withReplay<T>(bus: IEventBus<T>): ReplayBus<T> {
  // wraps bus, intercepts emit to buffer events,
  // replays on new on() subscriptions, etc.
}
```

The decorator:

- Accepts `IEventBus<T>` — works with any bus (plain or already decorated)
- Returns `IEventBus<T>` + plugin-specific methods
- Does not modify the original bus

## Consumer Wiring

### Core only

```bash
npm install @tiny-event-bus/core
```

```ts
const bus = createEventBus<MyEvents>();
```

### Core + React

```bash
npm install @tiny-event-bus/core @tiny-event-bus/react
```

```tsx
const bus = createEventBus<MyEvents>();
const { emit, on, clear } = useEventBus(bus);
```

### Core + React + Feature Plugin (future)

```bash
npm install @tiny-event-bus/core @tiny-event-bus/react @tiny-event-bus/replay
```

```tsx
import { createEventBus } from '@tiny-event-bus/core';
import { useEventBus } from '@tiny-event-bus/react';
import { withReplay } from '@tiny-event-bus/replay';

// Decorate the bus — React hooks accept IEventBus<T>
const bus = withReplay(createEventBus<MyEvents>());

// In a component — useEventBus returns core methods
const { emit, on, clear } = useEventBus(bus);

// Plugin-specific methods accessed directly on the bus instance
const history = bus.getHistory();
bus.replay();
```

### With Context (future)

```tsx
const bus = withReplay(createEventBus<MyEvents>());
const { Provider, useEventBus } = createBusContext<MyEvents>();

// Provider accepts IEventBus<T> — decorated bus works
<Provider bus={bus}>
  <App />
</Provider>;
```

## Future: Generic `useEventBus`

Currently `useEventBus` returns `{ emit, on, once, clear }` — the core `IEventBus` methods wrapped in stable `useCallback` refs.

When the first feature plugin ships, `useEventBus` will be evolved to generically return stable references for **all** methods on whatever bus type is passed. TypeScript generics ensure full type safety:

```tsx
// Future API — not yet implemented
const replayBus = withReplay(createEventBus<MyEvents>());
const { emit, on, clear, getHistory, replay } = useEventBus(replayBus);
//                        ^^^^^^^^^^  ^^^^^^ — plugin methods included
```

This avoids needing separate framework wrappers for each feature plugin.

## Plugin Authoring Conventions

| Convention             | Rule                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Package naming**     | `@tiny-event-bus/<plugin-name>`                                                                                    |
| **Core dependency**    | Peer-depend on `@tiny-event-bus/core`, never bundle it                                                             |
| **Export pattern**     | Export a factory function that accepts `IEventBus<T>`                                                              |
| **Type imports**       | Import types from `@tiny-event-bus/core`                                                                           |
| **Framework coupling** | Feature plugins must be framework-agnostic                                                                         |
| **Bridge packages**    | Only if a feature plugin needs framework-specific UI (e.g., `@tiny-event-bus/react-devtools` for a devtools panel) |

## Implemented

| Package                 | Status       |
| ----------------------- | ------------ |
| `@tiny-event-bus/core`  | ✅ Published |
| `@tiny-event-bus/react` | ✅ Published |

## Planned (not yet implemented)

The conventions in this document apply to future plugins:

| Package                          | Description                                                   |
| -------------------------------- | ------------------------------------------------------------- |
| `@tiny-event-bus/replay`         | Event replay — buffer past events, replay to late subscribers |
| `@tiny-event-bus/devtools`       | Debug/inspection tooling                                      |
| `@tiny-event-bus/react-devtools` | React UI panel for devtools (bridge package)                  |

## Peer Dependency Map

| Package                               | Peer depends on               |
| ------------------------------------- | ----------------------------- |
| `@tiny-event-bus/core`                | — (no deps)                   |
| `@tiny-event-bus/react`               | `core` + `react >=17`         |
| `@tiny-event-bus/replay` (\*)         | `core`                        |
| `@tiny-event-bus/devtools` (\*)       | `core`                        |
| `@tiny-event-bus/react-devtools` (\*) | `core` + `react` + `devtools` |

(\*) = planned, not yet implemented
