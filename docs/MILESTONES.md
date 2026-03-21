# Milestones

See [ARCHIVE.md](ARCHIVE.md) for older milestones.

## v0.9.0 Milestones

39. ✅ Replay package scaffolding — `packages/replay/` with `package.json` (`@tiny-event-bus/replay`), peer dep on `@tiny-event-bus/core`, dual ESM/CJS exports, `tsconfig.json`, `tsconfig.cjs.json`, `vitest.config.ts` (90% thresholds), `src/types.ts` (ReplayEntry, ReplayOptions, ReplayBus interface), `src/with-replay.ts` (shell decorator delegating to inner bus), `src/index.ts`, `README.md`, skeleton tests, update AGENTS.md + README.md
40. ✅ Emit buffering — TDD: `emit()` buffers as ReplayEntry with timestamp, FIFO eviction at maxSize, default maxSize 50, events still reach subscribers via delegation, fault isolation (error in handler doesn't prevent buffering), update AGENTS.md
41. ✅ Auto-replay on subscribe — TDD: `on()` replays buffered events for event type, `once()` replays first buffered event (satisfied, no-op unsub), `onAny()` replays all in chronological order, `autoReplay: false` disables replay, fault isolation during replay, update AGENTS.md
42. ✅ History API — TDD: `getHistory(event?)` returns filtered/all entries as defensive copy, `clearHistory(event?)` removes entries by event or all, `clear()` does NOT clear history, update replay README + AGENTS.md
43. ✅ Generic `useEventBus` — refactored `createEventBus` to return object literal typed as `IEventBus<T>` (removed `EventBus` class export), migrated core tests to `createEventBus()`, fixed `BusInspector.tsx` type, refactored `use-event-bus.ts` to dynamically discover all bus methods via `Object.keys` + `BusMethods<B>` mapped type, stable refs via `useMemo`, backward compat verified, update AGENTS.md + READMEs
44. ✅ Example app: dual-bus wiring — added `ActivityEvents` type + `activityBus` with `withReplay`, second `createBusContext`, nested `<ActivityBusProvider>` in `<ShopBusProvider>`, ProductCatalog/CartSidebar/SearchModal emit `activity:log`, added `@tiny-event-bus/replay` dep to example, update AGENTS.md
45. ✅ Example app: NotificationCenter + BusInspector — new NotificationCenter component (bell icon, toggleable panel, replays activity history on mount), moved AnalyticsLogger to ActivityBus, enhanced BusInspector to show both buses + `getHistory()` replay history, updated PLUGIN_ARCHITECTURE.md + READMEs + AGENTS.md

## v0.10.0 Milestones

46. ✅ Package metadata & npm readiness — add `publishConfig`, `repository`, `homepage`, `bugs` to all three package.json files, set all versions to `0.10.0`, verify with `npm pack --dry-run`
47. ✅ Changesets setup — install `@changesets/cli`, `changeset init`, configure `.changeset/config.json` (public access, main branch, independent versioning, auto-patch internal deps), add root scripts (`changeset`, `version`, `release`)
48. ✅ End-to-end dry-run validation — single-package + multi-package dry-runs: create changesets → `pnpm version` → verify bumps + changelogs + peer deps → `npm publish --dry-run` → revert
49. ✅ Documentation & AGENTS.md updates — AGENTS.md (Tech Stack, Project Structure, Key Decisions), README (Releasing section with release branch workflow + git tags), MILESTONES.md, package READMEs (npm version badges)
50. ⬜ First publish to npm — manual step when ready: `npm login` + 2FA, release branch PR, `pnpm release`, `git push --tags`

## Future backlog

- evaluate react-hooks/refs rule for render-time ref assignment pattern in useEvent/useAnyEvent
- Trigger CI on main after Dependabot auto-merge (GITHUB_TOKEN merges don't trigger workflows)
- GitHub Action for automated CI publish (changesets/action)
- Migration to Conventional Commits + semantic-release
- Debug/DevTools mode
- `onceAny` — fire catch-all handler only once then auto-unsubscribe
- CONTRIBUTING.md — release workflow, branching strategy, changeset instructions (move from AGENTS.md Key Decisions)

Architecture supports all without breaking changes.
