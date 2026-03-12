# Milestones

See [ARCHIVE.md](ARCHIVE.md) for older milestones.

## v0.4.0 Milestones

21. ✅ Monorepo scaffold — pnpm workspace setup, `pnpm-workspace.yaml`, root `package.json` (private, workspace scripts), `.npmrc`, delete `package-lock.json`, update MILESTONES + AGENTS.md with new structure and decisions
22. ✅ Core package extraction — `packages/core/` with `package.json` (`@tiny-event-bus/core`), `tsconfig.json`, `tsconfig.cjs.json`, `vitest.config.ts`, move `types.ts` + `event-bus.ts` + `index.ts` + 4 test files, build ESM+CJS, all 45 core tests pass, add `packages/core/README.md`, update AGENTS.md
23. ✅ React plugin extraction — `packages/react/` with `package.json` (`@tiny-event-bus/react`), peer deps on core + React, `tsconfig.json`, `tsconfig.cjs.json`, `vitest.config.ts`, move 5 source + 5 test files, update imports from relative core paths to `@tiny-event-bus/core`, all 27 React tests pass, delete old `src/`, add `packages/react/README.md`, update AGENTS.md
24. ✅ Workspace verification — `pnpm -r run build` + `pnpm -r run test` + `pnpm -r run typecheck` all green, `pnpm pack` produces correct tarballs, verify core has zero React code, verify React dist imports `@tiny-event-bus/core`, `workspace:^` resolved to `^0.4.0` in tarball, update MILESTONES.md
25. ✅ Example app migration — updated `examples/react/` deps to `@tiny-event-bus/core` + `@tiny-event-bus/react` (workspace:*), updated 3 imports across 2 files, `pnpm -r run build` all green (including Vite build), dev server verified, example README updated to pnpm, update AGENTS.md
26. ✅ Docs + plugin guide — rewrote root README.md (packages table, separate install paths, plugin architecture section, monorepo dev commands), verified AGENTS.md up to date, zero stale TODOs, update MILESTONES.md + backlog

## v0.5.0 Milestones

27. ✅ Widen React hooks to `IEventBus<T>` — changed all hook/context parameter types from concrete `EventBus<T>` to `IEventBus<T>` interface across 4 source files (`use-event.ts`, `use-event-bus.ts`, `use-any-event.ts`, `create-bus-context.ts`), non-breaking change, enables decorator-pattern feature plugins, all 27 existing tests pass unchanged
28. ✅ `useEventBus` returns `clear` (TDD) — 2 tests, added `clear` to `BusActions<T>` interface and return value, `useCallback`-wrapped expression body, verified `clear()` removes all listeners and `clear(event)` removes only that event's listeners, refactored all callbacks to consistent expression-body style
29. ✅ Plugin architecture design — created PLUGIN_ARCHITECTURE.md documenting decorator pattern (`withReplay(bus)`), two independent axes (framework vs feature plugins), composition conventions, consumer wiring examples, plugin authoring conventions, peer dependency map, future generic `useEventBus` design, updated AGENTS.md

## Future backlog

- event replay support as plugin
- integrate renovate to auto update dependencies
- semver and CI pipeline
- Debug/DevTools mode
- generic `useEventBus` — dynamically return stable refs for all methods on any bus type (queued for first feature plugin)
- `onceAny` — fire catch-all handler only once then auto-unsubscribe

Architecture supports all without breaking changes.
