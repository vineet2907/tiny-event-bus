# Milestones

See [ARCHIVE.md](ARCHIVE.md) for older milestones.

## v0.5.0 Milestones

27. ✅ Widen React hooks to `IEventBus<T>` — changed all hook/context parameter types from concrete `EventBus<T>` to `IEventBus<T>` interface across 4 source files (`use-event.ts`, `use-event-bus.ts`, `use-any-event.ts`, `create-bus-context.ts`), non-breaking change, enables decorator-pattern feature plugins, all 27 existing tests pass unchanged
28. ✅ `useEventBus` returns `clear` (TDD) — 2 tests, added `clear` to `BusActions<T>` interface and return value, `useCallback`-wrapped expression body, verified `clear()` removes all listeners and `clear(event)` removes only that event's listeners, refactored all callbacks to consistent expression-body style
29. ✅ Plugin architecture design — created PLUGIN_ARCHITECTURE.md documenting decorator pattern (`withReplay(bus)`), two independent axes (framework vs feature plugins), composition conventions, consumer wiring examples, plugin authoring conventions, peer dependency map, future generic `useEventBus` design, updated AGENTS.md

## v0.6.0 Milestones

30. ✅ EditorConfig — `.editorconfig` at workspace root codifying existing conventions (2-space indent, UTF-8, LF, trim trailing whitespace, final newline), MD override for trailing whitespace, update AGENTS.md
31. ✅ ESLint 9 + Prettier — flat config with `typescript-eslint` + `eslint-config-prettier` + `react-hooks` plugin, `.prettierrc` + `.prettierignore`, root scripts (`lint`, `lint:fix`, `format`, `format:check`), lint gates build, fix all existing violations, update AGENTS.md
32. ✅ Test coverage — `@vitest/coverage-v8`, 90% thresholds (lines/branches/functions/statements), `lcov` reporter for future Codecov, `test:coverage` scripts, `coverage/` in `.gitignore`, 100% coverage across both packages, update AGENTS.md

## Future backlog

- CI pipeline (GitHub Actions) + Codecov + README badges (CI status, coverage, TypeScript, license)
- evaluate react-hooks/refs rule for render-time ref assignment pattern in useEvent/useAnyEvent
- event replay support as plugin
- integrate renovate to auto update dependencies
- Debug/DevTools mode
- generic `useEventBus` — dynamically return stable refs for all methods on any bus type (queued for first feature plugin)
- `onceAny` — fire catch-all handler only once then auto-unsubscribe

Architecture supports all without breaking changes.
