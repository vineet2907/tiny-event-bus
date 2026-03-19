# Milestones

See [ARCHIVE.md](ARCHIVE.md) for older milestones.

## v0.8.0 Milestones

36. ✅ Dependabot configuration — `.github/dependabot.yml` with `npm` ecosystem entries for all workspace directories + `github-actions` ecosystem, weekly Wednesday schedule, grouping for reduced PR noise, `.github/workflows/dependabot-automerge.yml` for auto-approving + squash-merging patch/minor updates after CI passes, update AGENTS.md
37. ✅ Gitleaks secret scanning — `.gitleaks.toml` config, `hooks/pre-commit` shell script runs gitleaks on staged changes, `gitleaks-action` CI step in `.github/workflows/ci.yml`, document local setup (`brew install gitleaks`) in README.md, update AGENTS.md
38. ✅ Harden .gitignore + final docs — added `.env*`, `*.pem`, `*.key`, `.secrets` patterns to `.gitignore`, final AGENTS.md review (Tech Stack table, Project Structure, CI description), update MILESTONES.md

## v0.9.0 Milestones

39. ✅ Replay package scaffolding — `packages/replay/` with `package.json` (`@tiny-event-bus/replay`), peer dep on `@tiny-event-bus/core`, dual ESM/CJS exports, `tsconfig.json`, `tsconfig.cjs.json`, `vitest.config.ts` (90% thresholds), `src/types.ts` (ReplayEntry, ReplayOptions, ReplayBus interface), `src/with-replay.ts` (shell decorator delegating to inner bus), `src/index.ts`, `README.md`, skeleton tests, update AGENTS.md + README.md
40. ✅ Emit buffering — TDD: `emit()` buffers as ReplayEntry with timestamp, FIFO eviction at maxSize, default maxSize 50, events still reach subscribers via delegation, fault isolation (error in handler doesn't prevent buffering), update AGENTS.md
41. ✅ Auto-replay on subscribe — TDD: `on()` replays buffered events for event type, `once()` replays first buffered event (satisfied, no-op unsub), `onAny()` replays all in chronological order, `autoReplay: false` disables replay, fault isolation during replay, update AGENTS.md
42. ✅ History API — TDD: `getHistory(event?)` returns filtered/all entries as defensive copy, `clearHistory(event?)` removes entries by event or all, `clear()` does NOT clear history, update replay README + AGENTS.md
43. ✅ Generic `useEventBus` — refactored `createEventBus` to return object literal typed as `IEventBus<T>` (removed `EventBus` class export), migrated core tests to `createEventBus()`, fixed `BusInspector.tsx` type, refactored `use-event-bus.ts` to dynamically discover all bus methods via `Object.keys` + `BusMethods<B>` mapped type, stable refs via `useMemo`, backward compat verified, update AGENTS.md + READMEs
44. ✅ Example app: dual-bus wiring — added `ActivityEvents` type + `activityBus` with `withReplay`, second `createBusContext`, nested `<ActivityBusProvider>` in `<ShopBusProvider>`, ProductCatalog/CartSidebar/SearchModal emit `activity:log`, added `@tiny-event-bus/replay` dep to example, update AGENTS.md
45. ✅ Example app: NotificationCenter + BusInspector — new NotificationCenter component (bell icon, toggleable panel, replays activity history on mount), moved AnalyticsLogger to ActivityBus, enhanced BusInspector to show both buses + `getHistory()` replay history, updated PLUGIN_ARCHITECTURE.md + READMEs + AGENTS.md

## Future backlog

- evaluate react-hooks/refs rule for render-time ref assignment pattern in useEvent/useAnyEvent
- Debug/DevTools mode
- `onceAny` — fire catch-all handler only once then auto-unsubscribe

Architecture supports all without breaking changes.
