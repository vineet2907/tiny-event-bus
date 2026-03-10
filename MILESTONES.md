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

## Future Extensions (not in v0.3.0)

- Stress-test max event payload size a single bus instance can handle without performance degradation (large objects, arrays, binary data)
- `off(event, handler)` as alternative to closure-based unsubscribe
- Middleware/plugins
- Debug/DevTools mode
- Symbol event keys (non-colliding private events)
- `useEventBus` returning `off`/`clear` for completeness
- `onceAny` — fire catch-all handler only once then auto-unsubscribe

Architecture supports all without breaking changes.
