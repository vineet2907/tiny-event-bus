# Tiny Event Bus — Project Context

> Compact context file for LLM-assisted development. Keep under 200 lines.

## What

A zero-dependency, TypeScript-first event bus for React component communication.
Framework-agnostic core + thin React hook layer.

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Consumer App                                   │
│                                                 │
│   ComponentA ──emit──►  EventBus  ◄──on── ComponentB
│                          (Map+Set)              │
│   useEventBus(bus)                 useEvent(..) │
│       ▼                               ▼        │
│   { emit, on, once }         useRef + useEffect │
│   (useCallback)              (auto-cleanup)     │
└─────────────────────────────────────────────────┘
```

**Data flow**: Producer calls `emit()` → EventBus iterates handler Set (snapshot copy) → each handler invoked in try/catch → Consumer receives typed payload. No state stored, no re-renders triggered.

**Layer separation**:
- **Core** (`tiny-event-bus`): `EventBus` class, pure TypeScript, zero deps, framework-agnostic
- **React** (`tiny-event-bus/react`): `useEvent` + `useEventBus` hooks, thin wrappers over core, requires React >=17

## Tech Stack

| Category | Choice | Why |
|----------|--------|-----|
| Language | TypeScript 5.7+ (strict) | Full generic type safety, catch errors at compile time |
| Target | ES2020 | Supports Map/Set natively, covers Node 20+ and modern browsers |
| Build | plain tsc (two passes) | Under 1KB — no bundler needed; ESM → `dist/esm`, CJS → `dist/cjs` |
| Tests | Vitest 3.x + jsdom | Fast watch mode for TDD, built-in type assertions, jsdom for React hooks |
| React testing | @testing-library/react 16 | Industry standard for hook/component testing |
| React | >=17 (peer dep) | Supports hooks API; tested with React 19 |
| Node | >=20 | LTS target |
| Module system | Dual ESM/CJS | `"type": "module"` with CJS fallback via package exports map |

**Bundle size**: Core ~450 B, Core + React ~640 B (gzipped)

## When to Use (vs React State)

- **Event bus**: fire-and-forget signals (toasts, analytics, shortcuts, cross-module notifications). No re-renders. No stored state.
- **React state**: UI data that drives rendering (useState, Context).
- **Rule**: if a component needs to render data, use React state. If something needs to react to a signal, use the event bus.

## Project Structure

```text
tiny-event-bus/
├── src/
│   ├── types.ts              # EventMap, EventHandler, AnyEventHandler, Unsubscribe, IEventBus
│   ├── event-bus.ts           # EventBus class + createEventBus factory
│   ├── index.ts               # Public API (core)
│   ├── __tests__/
│   │   ├── event-bus.test.ts      # Core unit tests (on, emit, unsub, once, clear, error isolation)
│   │   ├── introspection.test.ts  # Introspection API tests
│   │   ├── on-any.test.ts         # onAny catch-all listener tests
│   │   └── performance.test.ts    # Benchmark regression guards
│   ├── react/
│   │   ├── use-event.ts       # useEvent(event, handler, bus?) hook
│   │   ├── use-any-event.ts   # useAnyEvent(handler, bus) hook
│   │   ├── use-event-bus.ts   # useEventBus(bus) → { emit, on, once }
│   │   ├── create-bus-context.ts # createBusContext factory (scoped instances)
│   │   ├── index.ts           # Public API (react)
│   │   └── __tests__/
│   │       ├── use-event.test.tsx       # React hook tests
│   │       ├── use-any-event.test.tsx   # Catch-all hook tests
│   │       ├── use-event-bus.test.tsx   # Convenience hook tests
│   │       ├── create-bus-context.test.tsx # Scoped context tests
│   │       └── integration.test.tsx     # Multi-component integration tests
├── examples/
│   └── react/                # Shopping cart demo app (Vite + React 19)
│       ├── src/events.ts      # Event map + shared bus instance
│       ├── src/context/       # CartContext (React state)
│       ├── src/data/          # Shared product data
│       ├── src/components/    # ProductCatalog, CartSidebar, ToastContainer, AnalyticsLogger, SearchModal, BusInspector
│       └── README.md          # State vs bus decision guide
├── README.md                  # Living docs, updated every milestone
├── MILESTONES.md              # Living docs, version wise milestone implementation status
├── PROJECT_CONTEXT.md         # This file
├── package.json
├── tsconfig.json              # Strict, ES2020, declaration emit
├── tsconfig.cjs.json          # CJS build config
└── vitest.config.ts
```

## Core Design

- Generic class: `EventBus<TEventMap extends Record<string, any>>`
- Storage: `Map<keyof TEventMap, Set<Handler>>` for O(1) add/remove, O(n) emit
- `on()` returns an `Unsubscribe` function
- `emit()` wraps each handler in try/catch for fault isolation
- `once()` wraps `on()` with auto-unsubscribe after first call
- `clear(event?)` removes listeners for one event or all events
- `Set` prevents duplicate handler refs; emit snapshots the Set (`[...set]`) before iterating for safe mid-emit mutation
- Unsubscribe closure cleans up empty Sets from the Map (`if (set.size === 0) this.listeners.delete(event)`)
- `hasListeners(event)` checks `Set.size > 0` for O(1) lookup
- `listenerCount(event?)` returns per-event or total count across all events
- `eventNames()` returns `[...this.listeners.keys()]` — hygienic due to empty-Set cleanup
- `onAny()` subscribes to all events via separate `Set<AnyEventHandler>`, invoked in `emit` after event-specific handlers, same try/catch + snapshot pattern
- `clear()` clears both event-specific and `onAny` listeners; `clear(event)` only clears event-specific
- `listenerCount()` includes `onAny` count in total; `listenerCount(event)` does not
- No state storage, no getState, no replay by design

## React Layer

- `useEvent(event, handler, bus)` — subscribes in useEffect, cleans up on unmount, uses useRef for handler to prevent stale closures and re-subscription on re-render
- `useAnyEvent(handler, bus)` — subscribes to all events via `bus.onAny`, same useRef + useEffect pattern, auto-cleanup on unmount
- `useEventBus(bus)` — returns `{ emit, on, once }` with stable references
- `createBusContext<T>()` — factory returns `{ Provider, useEvent, useEventBus, useAnyEvent }`, internally wraps `React.createContext<EventBus<T> | null>`. Provider accepts `bus` prop. Returned hooks are pre-typed to `T` and read bus from context (no bus arg). Throws if used outside Provider.

## Package Entrypoints

- Root `"."` exports core (no React dependency)
- Subpath `"./react"` exports React hooks (requires React >=17 peer dep)

## Key Decisions

- **Build tool**: plain tsc, no bundler. Library is under 1KB; consumer bundler handles tree-shaking and minification.
- **Test runner**: Vitest 3.x. Fast watch mode for TDD, built-in expectTypeOf, jsdom support.
- **React test util**: @testing-library/react. Industry standard, 32M downloads/week.
- **Type assertions**: Vitest built-in expectTypeOf. Eliminates separate expect-type dependency.
- **Subscriber storage**: Map + Set. O(1) subscribe/unsubscribe, Set prevents duplicate handlers.
- **Handler in hooks**: useRef. Prevents re-subscription every render, avoids stale closures.
- **Global singleton**: consumer creates it, not the library. Library exports class + factory only.
- **Scope**: v1 global only. v1.2 adds `createBusContext` factory for scoped React contexts backed by `createEventBus`.

## Milestones

See [MILESTONES.md](MILESTONES.md) for milestone status and future extensions.

## TDD Protocol

- Run `vitest --watch` continuously
- Write **one** failing test → implement minimum to pass → refactor → repeat. Never batch multiple failing tests at once.
- Pause after each red-green-refactor cycle for user review before next test

## Code Style

- **Update MILESTONES.md before starting implementation** — add planned milestones with ⬜ status before writing any code for a new version
- No JSDoc or inline comments that restate what the code already says
- Comments only for: TODOs, non-obvious "why" decisions, workarounds
- Let type signatures, function names, and tests document intent
- README and examples updated every milestone (check and update before marking complete)
- TODOs in code and docs for pending features, removed when built
- Run `grep -r "TODO" src/ examples/ README.md` to see pending work at any point