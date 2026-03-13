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

| Category        | Choice                                     | Why                                                                                          |
| --------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Language        | TypeScript 5.7+ (strict)                   | Full generic type safety, catch errors at compile time                                       |
| Target          | ES2020                                     | Supports Map/Set natively, covers Node 20+ and modern browsers                               |
| Package manager | pnpm 10.x (via corepack)                   | Strict dep isolation, industry standard for TS lib monorepos (Vue/Vite/Vitest)               |
| Monorepo        | pnpm workspaces                            | `packages/*` + `examples/*`, shared lockfile, workspace protocol for inter-package deps      |
| Build           | plain tsc (two passes per package)         | Under 1KB — no bundler needed; ESM → `dist/esm`, CJS → `dist/cjs`                            |
| Tests           | Vitest 3.x                                 | Fast watch mode for TDD, built-in type assertions; core uses `node` env, react uses `jsdom`  |
| React testing   | @testing-library/react 16                  | Industry standard for hook/component testing                                                 |
| React           | >=17 (peer dep of `@tiny-event-bus/react`) | Supports hooks API; tested with React 19                                                     |
| Node            | >=20                                       | LTS target                                                                                   |
| Module system   | Dual ESM/CJS                               | `"type": "module"` with CJS fallback via package exports map                                 |
| Editor config   | EditorConfig                               | Consistent formatting across editors and contributors                                        |
| Linting         | ESLint 10 + typescript-eslint              | Flat config, recommended rules, react-hooks plugin for React package, gates build            |
| Formatting      | Prettier                                   | Consistent code style, integrated with ESLint via eslint-config-prettier                     |
| Test coverage   | @vitest/coverage-v8                        | v8 provider, 90% thresholds enforced, json-summary + lcov reporters, badge via pre-push hook |
| CI              | GitHub Actions                             | Node 22, lint + format + typecheck + build + test on push/PR to `main`                       |

**Bundle size** (ESM JS, gzipped): Core ~613 B, React ~623 B, Core + React ~1.2 KB. Keep updated after code changes.

## Project Structure

```text
tiny-event-bus/                    # pnpm workspace root (private)
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI — lint, format, typecheck, build, test
├── pnpm-workspace.yaml            # workspace: packages/* + examples/*
├── .npmrc                         # link-workspace-packages=true
├── .editorconfig                  # 2-space indent, UTF-8, LF, trim trailing whitespace
├── .prettierrc                    # singleQuote, semi, trailingComma: all
├── .prettierignore                # dist, coverage, badges, pnpm-lock.yaml
├── eslint.config.mjs              # ESLint 10 flat config + typescript-eslint + prettier + react-hooks
├── .gitignore                     # node_modules, dist, coverage, tsbuildinfo
├── package.json                   # private, workspace scripts, shared devDeps
├── hooks/
│   └── pre-push                   # Aborts push if coverage badge is out of date
├── scripts/
│   ├── generate-coverage-badge.mjs # Runner: reads coverage JSON, writes badges/coverage.svg
│   ├── vitest.config.ts           # Vitest config for script tests
│   └── lib/
│       ├── coverage-badge.mjs     # Pure functions: discover, parse, average, badge SVG
│       └── __tests__/             # Unit tests for coverage badge lib
├── badges/
│   └── coverage.svg               # Auto-generated coverage badge (committed via pre-push hook)
├── packages/
│   ├── core/                      # @tiny-event-bus/core — framework-agnostic event bus
│   │   ├── package.json           # zero deps, dual ESM/CJS exports
│   │   ├── tsconfig.json          # ES2020, strict, declaration emit
│   │   ├── tsconfig.cjs.json      # CJS build
│   │   ├── vitest.config.ts       # env: node, v8 coverage, 90% thresholds
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
│       ├── vitest.config.ts       # env: jsdom, v8 coverage, 90% thresholds
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
├── docs/
│   ├── MILESTONES.md              # Living docs, version wise milestone implementation status
│   ├── ARCHIVE.md                 # Older milestones
│   └── PLUGIN_ARCHITECTURE.md     # Plugin system design (decorator pattern, composition conventions)
├── README.md                      # Living docs, updated every milestone
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

- `useEvent(event, handler, bus)` — subscribes in useEffect, cleans up on unmount, uses useRef for handler to prevent stale closures and re-subscription on re-render. Imports types from `@tiny-event-bus/core`. Accepts `IEventBus<T>` (interface, not concrete class) to support decorator-pattern plugins.
- `useAnyEvent(handler, bus)` — subscribes to all events via `bus.onAny`, same useRef + useEffect pattern, auto-cleanup on unmount. Accepts `IEventBus<T>`.
- `useEventBus(bus)` — returns `{ emit, on, once, clear }` with stable references. Accepts `IEventBus<T>`.
- `createBusContext<T>()` — factory returns `{ Provider, useEvent, useEventBus, useAnyEvent }`, internally wraps `React.createContext<IEventBus<T> | null>`. Provider accepts `bus` prop typed as `IEventBus<T>`. Returned hooks are pre-typed to `T` and read bus from context (no bus arg). Throws if used outside Provider.

## Package Entrypoints

- `@tiny-event-bus/core` — `npm install @tiny-event-bus/core` — exports `EventBus`, `createEventBus`, types. Zero dependencies.
- `@tiny-event-bus/react` — `npm install @tiny-event-bus/react` — exports `useEvent`, `useEventBus`, `useAnyEvent`, `createBusContext`. Peer deps: `@tiny-event-bus/core` + `react >=17`.
- Each package has dual ESM/CJS exports via `package.json` exports map.

## Key Decisions

- **Monorepo**: pnpm workspaces for strict dep isolation, faster installs, industry standard for TS lib monorepos. No Turborepo — overkill for 2-3 packages.
- **Scoped naming**: `@tiny-event-bus/core` + `@tiny-event-bus/react`. Consistent, scales to future plugins.
- **Plugin model**: peer dependency — plugins import core types/classes directly. No `bus.use()` registry. React hooks accept `IEventBus<T>` interface (not concrete class) to enable decorator-pattern feature plugins. See [PLUGIN_ARCHITECTURE.md](docs/PLUGIN_ARCHITECTURE.md) for full design.
- **Plugin composition**: decorator pattern — feature plugins export `withX(bus)` factories that accept `IEventBus<T>` and return enhanced bus. Framework plugins and feature plugins are independent axes, composed at the consumer level.
- **Build tool**: plain tsc, no bundler. Library is under 1KB; consumer bundler handles tree-shaking and minification.
- **Test runner**: Vitest 3.x. Fast watch mode for TDD, built-in expectTypeOf, jsdom support.
- **Subscriber storage**: Map + Set. O(1) subscribe/unsubscribe, Set prevents duplicate handlers.
- **Global singleton**: consumer creates it, not the library. Library exports class + factory only.
- **React test util**: @testing-library/react. Industry standard, 32M downloads/week.
- **Handler in hooks**: useRef. Prevents re-subscription every render, avoids stale closures.
- **Scope**: `createBusContext` factory for scoped React contexts backed by `createEventBus`.

## Milestones

See [MILESTONES.md](docs/MILESTONES.md) for milestone status and future extensions.

## Code Style

- Each milestone is small enough to review in one sitting and leaves the code in stable and shippable state
- **Update MILESTONES.md before starting implementation** — add planned milestones with ⬜ status before writing any code for a new version
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
