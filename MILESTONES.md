# Milestones

## v1 Milestones

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

## v1.1 Milestones

12. ✅ Introspection (TDD) — 11 tests, `hasListeners`, `listenerCount`, `eventNames` on `IEventBus` interface + `EventBus` class, empty-Set cleanup on unsubscribe, update README + docs
13. ✅ React demo scaffold — `examples/react/` with Vite + React 19 + TS, event map, blank shell renders, `npm run example` script
14. ✅ State-driven components — `CartContext`, `ProductCatalog`, `CartSidebar`, Add to Cart updates cart via state + emits bus events
15. ✅ Bus-driven components — `ToastContainer`, `AnalyticsLogger`, `SearchModal`, keyboard shortcuts, toast + analytics + search all wired
16. ✅ Bus Inspector + docs — `BusInspector` panel using introspection API, `examples/react/README.md` with decision table + architecture, update root README + MILESTONES + PROJECT_CONTEXT

## Test Summary

| File | Tests | Covers |
|------|-------|--------|
| `src/event-bus.test.ts` | 28 | on, emit, unsubscribe, once, clear, error isolation, snapshot iteration, re-entrancy, hasListeners, listenerCount, eventNames |
| `src/react/use-event.test.tsx` | 4 | subscribe, cleanup, stable handler (useRef), no re-subscription |
| `src/react/use-event-bus.test.tsx` | 4 | returns emit/on/once, emit fires, on+unsub, stable refs (useCallback) |
| `src/react/integration.test.tsx` | 8 | producer/consumer, multi-consumer, unmount isolation, event isolation, bus isolation, once+regular, cross-hook, rapid cycles |
| `src/performance.test.ts` | 4 | emit throughput, sub/unsub throughput, many event types, clear frees refs |
| **Total** | **48** | |

## Future Extensions (not in v1.1)

- Stress-test max event payload size a single bus instance can handle without performance degradation (large objects, arrays, binary data)
- Wildcard/catch-all listener (`onAny` or `*` pattern) for logging, analytics, debugging
- `off(event, handler)` as alternative to closure-based unsubscribe
- Scoped instances via React Context
- Middleware/plugins, event replay/history, priority listeners
- Debug/DevTools mode
- Symbol event keys (non-colliding private events)
- `useEventBus` returning `off`/`clear` for completeness

Architecture supports all without breaking changes.
