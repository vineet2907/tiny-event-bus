# Milestones

## v0.1.0 Milestones

1. ✅ Scaffold — package.json, tsconfig, vitest config, folders, README with full vision and TODOs, example skeleton
2. ✅ Core types — types.ts with IEventBus interface, update README
3. ✅ on + emit (TDD) — 5 tests, EventBus class, createEventBus factory
4. ✅ off, once, clear (TDD) — 7 tests, complete core API
5. ✅ Error isolation (TDD) — 5 tests, try/catch, safe iteration, re-entrancy
6. ⏭️ Type safety tests — skipped, handled via tsc --noEmit during lint
7. ✅ useEvent hook (TDD) — 4 tests, subscribe/cleanup/stable handler
8. ✅ useEventBus hook (TDD) — 4 tests, convenience hook
9. ✅ Integration tests — 8 tests, multi-component scenarios, lifecycle, isolation
10. ✅ Performance benchmarks — 4 tests, regression guards
11. ✅ Build + polish — tsc build, package exports, size check, README finalized

## v0.2.0 Milestones

12. ✅ Introspection (TDD) — 11 tests, `hasListeners`, `listenerCount`, `eventNames` on `IEventBus` interface + `EventBus` class, empty-Set cleanup on unsubscribe, update README + docs
13. ✅ React demo scaffold — `examples/react/` with Vite + React 19 + TS, event map, blank shell renders, `npm run example` script
14. ✅ State-driven components — `CartContext`, `ProductCatalog`, `CartSidebar`, Add to Cart updates cart via state + emits bus events
15. ✅ Bus-driven components — `ToastContainer`, `AnalyticsLogger`, `SearchModal`, keyboard shortcuts, toast + analytics + search all wired
16. ✅ Bus Inspector + docs — `BusInspector` panel using introspection API, `examples/react/README.md` with decision table + architecture, update root README + MILESTONES + PROJECT_CONTEXT

## v0.3.0 Milestones

17. ✅ `onAny` catch-all listener (TDD) — 13 tests, `AnyEventHandler` type, `onAny` on `IEventBus` interface + `EventBus` class, separate `Set<AnyEventHandler>` storage, invoked in `emit` after event-specific handlers, fault isolation, snapshot safety, wired into `clear()`/`listenerCount()`, refactored tests into 3 files
18. ✅ `useAnyEvent` hook (TDD) — 3 tests, subscribe to all events with auto-cleanup, `useRef` for handler stability, mirrors `useEvent` pattern
19. ✅ `createBusContext` scoped instances (TDD) — 6 tests, factory returns `{ Provider, useEvent, useEventBus, useAnyEvent }`, `React.createContext` internally, throws outside Provider, isolated scopes, pre-typed hooks with no bus arg
20. ✅ Demo update + docs — refactored `AnalyticsLogger` to `useAnyEvent` (logs all events), added `onAny`, `useAnyEvent`, `createBusContext` to README API tables, added scoped context example to README, updated demo README + MILESTONES + PROJECT_CONTEXT

## v0.4.0 Milestones

21. ✅ Monorepo scaffold — pnpm workspace setup, `pnpm-workspace.yaml`, root `package.json` (private, workspace scripts), `.npmrc`, delete `package-lock.json`, update MILESTONES + AGENTS.md with new structure and decisions
22. ✅ Core package extraction — `packages/core/` with `package.json` (`@tiny-event-bus/core`), `tsconfig.json`, `tsconfig.cjs.json`, `vitest.config.ts`, move `types.ts` + `event-bus.ts` + `index.ts` + 4 test files, build ESM+CJS, all 45 core tests pass, add `packages/core/README.md`, update AGENTS.md
23. ⬜ React plugin extraction — `packages/react/` with `package.json` (`@tiny-event-bus/react`), peer deps on core + React, `tsconfig.json`, `tsconfig.cjs.json`, `vitest.config.ts`, move 5 source + 5 test files, update imports from relative core paths to `@tiny-event-bus/core`, all React tests pass, delete old `src/`, add `packages/react/README.md`, update AGENTS.md
24. ⬜ Workspace verification — `pnpm -r run build` + `pnpm -r run test` + `pnpm -r run typecheck` all green, `pnpm pack` produces correct tarballs, verify core has zero React code, verify React dist imports `@tiny-event-bus/core`, update MILESTONES.md
25. ⬜ Example app migration — update `examples/react/` deps + imports to `@tiny-event-bus/core` + `@tiny-event-bus/react`, demo runs, update `examples/react/README.md`, update AGENTS.md
26. ⬜ Docs + plugin guide — rewrite root README.md (install, imports, dev commands, packages section, plugin architecture), final AGENTS.md update (full structure, entrypoints, decisions), update MILESTONES.md + backlog

## Future backlog

- event replay support as plugin
- integrate renovate to auto update dependencies
- semver and CI pipeline
- have a milestone archive, only have recent two milestones in this file, move older ones to archive
- Debug/DevTools mode
- `useEventBus` returning `clear` for completeness
- `onceAny` — fire catch-all handler only once then auto-unsubscribe

Architecture supports all without breaking changes.
