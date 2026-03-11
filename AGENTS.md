# Tiny Event Bus — Project Context

> Compact context file for LLM-assisted development. Keep under 200 lines.

## What

A zero-dependency, TypeScript-first event bus with plugin architecture.
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

**Layer separation** (pnpm workspace monorepo):
- **Core** (`@tiny-event-bus/core`): `EventBus` class, pure TypeScript, zero deps, framework-agnostic
- **React plugin** (`@tiny-event-bus/react`): `useEvent` + `useEventBus` hooks, thin wrappers over core, peer dep on `@tiny-event-bus/core` + `react >=17`
- Plugins import core types/classes via peer dependency — no `bus.use()` registry (yet)

## Tech Stack

| Category | Choice | Why |
|----------|--------|-----|
| Language | TypeScript 5.7+ (strict) | Full generic type safety, catch errors at compile time |
| Target | ES2020 | Supports Map/Set natively, covers Node 20+ and modern browsers |
| Package manager | pnpm 10.x (via corepack) | Strict dep isolation, industry standard for TS lib monorepos (Vue/Vite/Vitest) |
| Monorepo | pnpm workspaces | `packages/*` + `examples/*`, shared lockfile, workspace protocol for inter-package deps |
| Build | plain tsc (two passes per package) | Under 1KB — no bundler needed; ESM → `dist/esm`, CJS → `dist/cjs` |
| Tests | Vitest 3.x | Fast watch mode for TDD, built-in type assertions; core uses `node` env, react uses `jsdom` |
| React testing | @testing-library/react 16 | Industry standard for hook/component testing |
| React | >=17 (peer dep of `@tiny-event-bus/react`) | Supports hooks API; tested with React 19 |
| Node | >=20 | LTS target |
| Module system | Dual ESM/CJS | `"type": "module"` with CJS fallback via package exports map |

**Bundle size** (ESM JS, gzipped): Core ~613 B, React ~623 B, Core + React ~1.2 KB. Keep updated after code changes.

## Project Structure

```text
tiny-event-bus/                    # pnpm workspace root (private)
├── pnpm-workspace.yaml            # workspace: packages/* + examples/*
├── .npmrc                         # link-workspace-packages=true
├── package.json                   # private, workspace scripts, shared devDeps
├── packages/
│   ├── core/                      # @tiny-event-bus/core — framework-agnostic event bus
│   │   ├── package.json           # zero deps, dual ESM/CJS exports
│   │   ├── tsconfig.json          # ES2020, strict, declaration emit
│   │   ├── tsconfig.cjs.json      # CJS build
│   │   ├── vitest.config.ts       # env: node
│   │   ├── README.md              # per-package README for npmjs.com
│   │   └── src/
│   │       ├── types.ts           # EventMap, EventHandler, AnyEventHandler, Unsubscribe, IEventBus
│   │       ├── event-bus.ts       # EventBus class + createEventBus factory
│   │       ├── index.ts           # Public API
│   │       └── __tests__/         # event-bus, introspection, on-any, performance tests
│   └── react/                     # @tiny-event-bus/react — React hooks plugin
│       ├── package.json           # peerDeps: @tiny-event-bus/core + react >=17
│       ├── tsconfig.json          # ES2020, strict, jsx: react-jsx
│       ├── tsconfig.cjs.json      # CJS build
│       ├── vitest.config.ts       # env: jsdom
│       ├── README.md              # per-package README for npmjs.com
│       └── src/
│           ├── use-event.ts       # useEvent(event, handler, bus) hook
│           ├── use-any-event.ts   # useAnyEvent(handler, bus) hook
│           ├── use-event-bus.ts   # useEventBus(bus) → { emit, on, once }
│           ├── create-bus-context.ts # createBusContext factory (scoped instances)
│           ├── index.ts           # Public API
│           └── __tests__/         # use-event, use-any-event, use-event-bus, create-bus-context, integration tests
├── examples/
│   └── react/                     # Shopping cart demo app (Vite + React 19)
│       ├── src/events.ts          # Event map + shared bus instance
│       ├── src/context/           # CartContext (React state)
│       ├── src/data/              # Shared product data
│       ├── src/components/        # ProductCatalog, CartSidebar, ToastContainer, AnalyticsLogger, SearchModal, BusInspector
│       └── README.md              # State vs bus decision guide
├── README.md                      # Living docs, updated every milestone
├── MILESTONES.md                  # Living docs, version wise milestone implementation status
└── AGENTS.md                      # This file
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

## React Plugin

- `useEvent(event, handler, bus)` — subscribes in useEffect, cleans up on unmount, uses useRef for handler to prevent stale closures and re-subscription on re-render. Imports types from `@tiny-event-bus/core`.
- `useAnyEvent(handler, bus)` — subscribes to all events via `bus.onAny`, same useRef + useEffect pattern, auto-cleanup on unmount
- `useEventBus(bus)` — returns `{ emit, on, once }` with stable references
- `createBusContext<T>()` — factory returns `{ Provider, useEvent, useEventBus, useAnyEvent }`, internally wraps `React.createContext<EventBus<T> | null>`. Provider accepts `bus` prop. Returned hooks are pre-typed to `T` and read bus from context (no bus arg). Throws if used outside Provider.

## Package Entrypoints

- `@tiny-event-bus/core` — `npm install @tiny-event-bus/core` — exports `EventBus`, `createEventBus`, types. Zero dependencies.
- `@tiny-event-bus/react` — `npm install @tiny-event-bus/react` — exports `useEvent`, `useEventBus`, `useAnyEvent`, `createBusContext`. Peer deps: `@tiny-event-bus/core` + `react >=17`.
- Each package has dual ESM/CJS exports via `package.json` exports map.

## Key Decisions

- **Monorepo**: pnpm workspaces for strict dep isolation, faster installs, industry standard for TS lib monorepos. No Turborepo — overkill for 2-3 packages.
- **Scoped naming**: `@tiny-event-bus/core` + `@tiny-event-bus/react`. Consistent, scales to future plugins.
- **Plugin model**: peer dependency — plugins import core types/classes directly. No `bus.use()` registry yet (deferred to behavior-modifying plugins like replay/middleware).
- **Build tool**: plain tsc, no bundler. Library is under 1KB; consumer bundler handles tree-shaking and minification.
- **Test runner**: Vitest 3.x. Fast watch mode for TDD, built-in expectTypeOf, jsdom support.
- **Subscriber storage**: Map + Set. O(1) subscribe/unsubscribe, Set prevents duplicate handlers.
- **Global singleton**: consumer creates it, not the library. Library exports class + factory only.
- **React test util**: @testing-library/react. Industry standard, 32M downloads/week.
- **Handler in hooks**: useRef. Prevents re-subscription every render, avoids stale closures.
- **Scope**: `createBusContext` factory for scoped React contexts backed by `createEventBus`.

## Milestones

See [MILESTONES.md](MILESTONES.md) for milestone status and future extensions.

## TDD Protocol

- Run `vitest --watch` continuously
- Write **one** failing test → implement minimum to pass → refactor → repeat. Never batch multiple failing tests at once.
- Pause after each red-green-refactor cycle for user review before next test

## Code Style

- **Milestone gate**: after completing each milestone, wait for user review and approval before proceeding to the next milestone
- **Update MILESTONES.md before starting implementation** — add planned milestones with ⬜ status before writing any code for a new version
- No JSDoc or inline comments that restate what the code already says
- Comments only for: TODOs, non-obvious "why" decisions, workarounds
- Let type signatures, function names, and tests document intent
- AGENTS.md, MILESTONES.md, README and examples updated every milestone (check and update before marking complete)
- Request human code review after every milestone implementation
- TODOs in code and docs for pending features, removed when built
- Run `grep -r "TODO" packages/ examples/ README.md` to see pending work at any point