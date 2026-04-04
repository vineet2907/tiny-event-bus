# Tiny Event Bus — Project Context

> Compact context file for LLM-assisted development. Keep under 200 lines.

## What

A zero-dependency, TypeScript-first event bus with plugin architecture.
Framework-agnostic core + thin React hook layer.

## Architecture

**Data flow**: Producer calls `emit()` → EventBus iterates handler Set (snapshot copy) → each handler invoked in try/catch → Consumer receives typed payload. No state stored, no re-renders triggered.

**Layer separation** (pnpm workspace monorepo):

- **Core** (`@tiny-event-bus/core`): `createEventBus` factory, pure TypeScript, zero deps, framework-agnostic
- **Replay plugin** (`@tiny-event-bus/replay`): `withReplay(bus)` decorator, buffers events for late subscribers, peer dep on `@tiny-event-bus/core`
- **Middleware plugin** (`@tiny-event-bus/middleware`): `withMiddleware(bus, middlewares[])` decorator, intercepts `emit()` calls through a composable chain, peer dep on `@tiny-event-bus/core`. Middleware errors propagate to the caller (unlike handler errors in core which are swallowed). Event names are immutable within a chain — changing them throws at runtime.
- **React plugin** (`@tiny-event-bus/react`): `useEvent` + `useEventBus` hooks, thin wrappers over core, peer dep on `@tiny-event-bus/core` + `react >=17`
- Plugins import core types/classes via peer dependency — decorator pattern, no `bus.use()` registry

## Tech Stack

| Category        | Choice                                     |
| --------------- | ------------------------------------------ |
| Language        | TypeScript 5.7+ (strict)                   |
| Target          | ES2020                                     |
| Package manager | pnpm 10.x (via corepack)                   |
| Monorepo        | pnpm workspaces                            |
| Build           | plain tsc (two passes per package)         |
| Tests           | Vitest 3.x                                 |
| React testing   | @testing-library/react 16                  |
| React           | >=17 (peer dep of `@tiny-event-bus/react`) |
| Node            | >=20                                       |
| Module system   | Dual ESM/CJS                               |
| Linting         | ESLint 10 + typescript-eslint              |
| Formatting      | Prettier                                   |
| Test coverage   | @vitest/coverage-v8, 90% thresholds        |
| CI              | GitHub Actions                             |
| Dep updates     | Dependabot                                 |
| Secret scanning | gitleaks                                   |
| Versioning      | Changesets (@changesets/cli)               |
| Publishing      | npm (manual, `changeset publish`)          |

**Bundle size** (ESM JS, gzipped): Core ~633 B, React ~915 B, Replay ~764 B, Middleware ~TBD. Keep updated after code changes.

## Project Structure

```text
tiny-event-bus/                    # pnpm workspace root (private)
├── .changeset/                    # Changesets config + pending changeset files
├── .github/                       # CI (ci.yml), Dependabot, auto-merge workflow
├── hooks/                         # pre-commit (gitleaks), pre-push (coverage badge)
├── scripts/                       # Coverage badge generation + tests
├── badges/                        # Auto-generated coverage.svg
├── packages/
│   ├── core/                      # @tiny-event-bus/core — framework-agnostic event bus
│   │   ├── package.json           # zero deps, dual ESM/CJS exports
│   │   ├── README.md
│   │   └── src/
│   │       ├── types.ts           # EventMap, EventHandler, AnyEventHandler, Unsubscribe, IEventBus
│   │       ├── event-bus.ts       # createEventBus factory (object literal, closure-based privacy)
│   │       ├── index.ts
│   │       └── __tests__/
│   ├── replay/                    # @tiny-event-bus/replay — event replay plugin
│   │   ├── package.json           # peerDep: @tiny-event-bus/core, dual ESM/CJS exports
│   │   ├── README.md
│   │   └── src/
│   │       ├── types.ts           # ReplayEntry, ReplayOptions, ReplayBus interface
│   │       ├── with-replay.ts     # withReplay(bus, options?) decorator factory
│   │       ├── index.ts
│   │       └── __tests__/
│   ├── middleware/                # @tiny-event-bus/middleware — middleware plugin
│   │   ├── package.json           # peerDep: @tiny-event-bus/core, dual ESM/CJS exports
│   │   ├── README.md
│   │   └── src/
│   │       ├── types.ts           # Middleware<T>, MiddlewareNext<T>, MiddlewareBus<T>
│   │       ├── with-middleware.ts # withMiddleware(bus, middlewares[]) decorator factory
│   │       ├── index.ts
│   │       └── __tests__/
│   └── react/                     # @tiny-event-bus/react — React hooks plugin
│       ├── package.json           # peerDeps: @tiny-event-bus/core + react >=17
│       ├── README.md
│       └── src/
│           ├── use-event.ts       # useEvent(event, handler, bus) hook
│           ├── use-any-event.ts   # useAnyEvent(handler, bus) hook
│           ├── use-event-bus.ts   # useEventBus<B>(bus) → BusMethods<B> (dynamic discovery)
│           ├── create-bus-context.ts # createBusContext factory (scoped instances)
│           ├── index.ts
│           └── __tests__/
├── examples/
│   └── react/                     # Shopping cart demo (Vite + React 19, dual-bus: ShopBus + ActivityBus w/ replay)
├── docs/                          # MILESTONES.md, ARCHIVE.md, PLUGIN_ARCHITECTURE.md
├── README.md
└── AGENTS.md                      # This file
```

## Core Design

- Factory: `createEventBus<T>()` returns `IEventBus<T>` object literal with closure-based privacy
- Storage: `Map<keyof T, Set<Handler>>` for O(1) add/remove, O(n) emit
- `on()` returns an `Unsubscribe` function; `once()` wraps `on()` with auto-unsubscribe
- `emit()` wraps each handler in try/catch for fault isolation
- `Set` prevents duplicate handler refs; emit snapshots the Set (`[...set]`) before iterating for safe mid-emit mutation
- Unsubscribe closure cleans up empty Sets from the Map
- `onAny()` subscribes to all events via separate `Set<AnyEventHandler>`, same try/catch + snapshot pattern
- No state storage, no getState, no replay by design

## React Plugin

- `useEvent(event, handler, bus)` — subscribes in useEffect, cleans up on unmount, uses useRef for handler to prevent stale closures and re-subscription on re-render. Imports types from `@tiny-event-bus/core`. Accepts `IEventBus<T>` (interface, not concrete class) to support decorator-pattern plugins.
- `useAnyEvent(handler, bus)` — subscribes to all events via `bus.onAny`, same useRef + useEffect pattern, auto-cleanup on unmount. Accepts `IEventBus<T>`.
- `useEventBus<B>(bus)` — returns `BusMethods<B>` with stable references via `useMemo`. Dynamically discovers all function-valued properties on `bus` (supports decorated buses like `ReplayBus`). Accepts any `IEventBus<T>` or extension thereof.
- `createBusContext<T>()` — factory returns `{ Provider, useEvent, useEventBus, useAnyEvent }`, internally wraps `React.createContext<IEventBus<T> | null>`. Provider accepts `bus` prop typed as `IEventBus<T>`. Returned hooks are pre-typed to `T` and read bus from context (no bus arg). Throws if used outside Provider.

## Package Entrypoints

- `@tiny-event-bus/core` — `npm install @tiny-event-bus/core` — exports `createEventBus`, types (`IEventBus`, `EventMap`, etc.). Zero dependencies.
- `@tiny-event-bus/replay` — `npm install @tiny-event-bus/replay` — exports `withReplay`, `ReplayBus`, `ReplayEntry`, `ReplayOptions` types. Peer dep: `@tiny-event-bus/core`.
- `@tiny-event-bus/middleware` — `npm install @tiny-event-bus/middleware` — exports `withMiddleware`, `Middleware`, `MiddlewareNext`, `MiddlewareBus` types. Peer dep: `@tiny-event-bus/core`.
- `@tiny-event-bus/react` — `npm install @tiny-event-bus/react` — exports `useEvent`, `useEventBus`, `useAnyEvent`, `createBusContext`, `BusMethods` type. Peer deps: `@tiny-event-bus/core` + `react >=17`.
- Each package has dual ESM/CJS exports via `package.json` exports map.

## Key Decisions

- **Plugin model**: decorator pattern — `withX(bus)` factories accept `IEventBus<T>` and return enhanced bus. See [PLUGIN_ARCHITECTURE.md](docs/PLUGIN_ARCHITECTURE.md).
- **Build tool**: plain tsc, no bundler. Library is under 1KB; consumer bundler handles tree-shaking.
- **Global singleton**: consumer creates it, not the library. Library exports factory only.
- **Handler in hooks**: useRef. Prevents re-subscription every render, avoids stale closures.
- **Scope**: `createBusContext` factory for scoped React contexts backed by `createEventBus`.
- **Release workflow**: manual via Changesets — `pnpm changeset` (record intent), `pnpm changeset:version` (bump + changelog), `pnpm release` (build + publish + git tags). Release branch PR strategy for protected main. Independent versioning per package.

## Milestones

See [MILESTONES.md](docs/MILESTONES.md) for milestone status and future extensions.

## Code Style

- Each milestone is small enough to review in one sitting and leaves the code in stable and shippable state
- **Update MILESTONES.md before starting implementation** — add planned milestones with ⬜ status before writing any code for a new version
- **Mark each milestone ✅ in MILESTONES.md immediately after completing it** — do not batch status updates across milestones
- TDD - Write **one** failing test → implement minimum to pass → refactor → repeat. Never batch multiple failing tests at once.
- No JSDoc or inline comments that restate what the code already says
- Comments only for: TODOs, non-obvious "why" decisions, workarounds
- Let type signatures, function names, and tests document intent
- AGENTS.md, MILESTONES.md, README and examples updated every milestone (check and update before marking complete)
- Only two latest feature versions stay in MILESTONES.md file, move the older version milestones to ARCHIVE.md
- TODOs in code and docs for pending features, removed when built
- Run `grep -r "TODO" packages/ examples/ README.md` to see pending work at any point

### Code Review Gates

- **Outer gate**: after completing each milestone, wait for user review and approval before proceeding to the next milestone.
- **Inner gate**: pause after each red-green-refactor TDD cycle for user review and approval before proceeding to next test.
