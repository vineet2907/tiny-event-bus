# Milestones

## v0.8.0 Milestones

36. ✅ Dependabot configuration — `.github/dependabot.yml` with `npm` ecosystem entries for all workspace directories + `github-actions` ecosystem, weekly Wednesday schedule, grouping for reduced PR noise, `.github/workflows/dependabot-automerge.yml` for auto-approving + squash-merging patch/minor updates after CI passes, update AGENTS.md
37. ✅ Gitleaks secret scanning — `.gitleaks.toml` config, `hooks/pre-commit` shell script runs gitleaks on staged changes, `gitleaks-action` CI step in `.github/workflows/ci.yml`, document local setup (`brew install gitleaks`) in README.md, update AGENTS.md
38. ✅ Harden .gitignore + final docs — added `.env*`, `*.pem`, `*.key`, `.secrets` patterns to `.gitignore`, final AGENTS.md review (Tech Stack table, Project Structure, CI description), update MILESTONES.md

## v0.7.0 Milestones

33. ✅ GitHub Actions CI workflow — `.github/workflows/ci.yml`, triggers on push to `main` + PRs, Node 22, single job: lint, format check, typecheck, build packages + example, test with coverage (90% thresholds enforced), update AGENTS.md + README.md
34. ✅ Coverage badge generation — added `json-summary` reporter to vitest configs, `scripts/lib/coverage-badge.mjs` (pure functions: discover, parse, average, badge SVG, 17 unit tests), `scripts/generate-coverage-badge.mjs` runner, `badges/coverage.svg`, pre-push hook auto-commits badge, CI verifies badge is up to date, `prepare` script sets `core.hooksPath`, update AGENTS.md
35. ✅ README badges — added CI status + coverage badge images to README.md, final AGENTS.md review (updated test coverage description, verified project structure), update MILESTONES.md

## v0.6.0 Milestones

30. ✅ EditorConfig — `.editorconfig` at workspace root codifying existing conventions (2-space indent, UTF-8, LF, trim trailing whitespace, final newline), MD override for trailing whitespace, update AGENTS.md
31. ✅ ESLint 9 + Prettier — flat config with `typescript-eslint` + `eslint-config-prettier` + `react-hooks` plugin, `.prettierrc` + `.prettierignore`, root scripts (`lint`, `lint:fix`, `format`, `format:check`), lint gates build, fix all existing violations, update AGENTS.md
32. ✅ Test coverage — `@vitest/coverage-v8`, 90% thresholds (lines/branches/functions/statements), `lcov` reporter for future Codecov, `test:coverage` scripts, `coverage/` in `.gitignore`, 100% coverage across both packages, update AGENTS.md

## v0.5.0 Milestones

27. ✅ Widen React hooks to `IEventBus<T>` — changed all hook/context parameter types from concrete `EventBus<T>` to `IEventBus<T>` interface across 4 source files (`use-event.ts`, `use-event-bus.ts`, `use-any-event.ts`, `create-bus-context.ts`), non-breaking change, enables decorator-pattern feature plugins, all 27 existing tests pass unchanged
28. ✅ `useEventBus` returns `clear` (TDD) — 2 tests, added `clear` to `BusActions<T>` interface and return value, `useCallback`-wrapped expression body, verified `clear()` removes all listeners and `clear(event)` removes only that event's listeners, refactored all callbacks to consistent expression-body style
29. ✅ Plugin architecture design — created PLUGIN_ARCHITECTURE.md documenting decorator pattern (`withReplay(bus)`), two independent axes (framework vs feature plugins), composition conventions, consumer wiring examples, plugin authoring conventions, peer dependency map, future generic `useEventBus` design, updated AGENTS.md

## v0.4.0 Milestones

21. ✅ Monorepo scaffold — pnpm workspace setup, `pnpm-workspace.yaml`, root `package.json` (private, workspace scripts), `.npmrc`, delete `package-lock.json`, update MILESTONES + AGENTS.md with new structure and decisions
22. ✅ Core package extraction — `packages/core/` with `package.json` (`@tiny-event-bus/core`), `tsconfig.json`, `tsconfig.cjs.json`, `vitest.config.ts`, move `types.ts` + `event-bus.ts` + `index.ts` + 4 test files, build ESM+CJS, all 45 core tests pass, add `packages/core/README.md`, update AGENTS.md
23. ✅ React plugin extraction — `packages/react/` with `package.json` (`@tiny-event-bus/react`), peer deps on core + React, `tsconfig.json`, `tsconfig.cjs.json`, `vitest.config.ts`, move 5 source + 5 test files, update imports from relative core paths to `@tiny-event-bus/core`, all 27 React tests pass, delete old `src/`, add `packages/react/README.md`, update AGENTS.md
24. ✅ Workspace verification — `pnpm -r run build` + `pnpm -r run test` + `pnpm -r run typecheck` all green, `pnpm pack` produces correct tarballs, verify core has zero React code, verify React dist imports `@tiny-event-bus/core`, `workspace:^` resolved to `^0.4.0` in tarball, update MILESTONES.md
25. ✅ Example app migration — updated `examples/react/` deps to `@tiny-event-bus/core` + `@tiny-event-bus/react` (workspace:\*), updated 3 imports across 2 files, `pnpm -r run build` all green (including Vite build), dev server verified, example README updated to pnpm, update AGENTS.md
26. ✅ Docs + plugin guide — rewrote root README.md (packages table, separate install paths, plugin architecture section, monorepo dev commands), verified AGENTS.md up to date, zero stale TODOs, update MILESTONES.md + backlog

## v0.3.0 Milestones

17. ✅ `onAny` catch-all listener (TDD) — 13 tests, `AnyEventHandler` type, `onAny` on `IEventBus` interface + `EventBus` class, separate `Set<AnyEventHandler>` storage, invoked in `emit` after event-specific handlers, fault isolation, snapshot safety, wired into `clear()`/`listenerCount()`, refactored tests into 3 files
18. ✅ `useAnyEvent` hook (TDD) — 3 tests, subscribe to all events with auto-cleanup, `useRef` for handler stability, mirrors `useEvent` pattern
19. ✅ `createBusContext` scoped instances (TDD) — 6 tests, factory returns `{ Provider, useEvent, useEventBus, useAnyEvent }`, `React.createContext` internally, throws outside Provider, isolated scopes, pre-typed hooks with no bus arg
20. ✅ Demo update + docs — refactored `AnalyticsLogger` to `useAnyEvent` (logs all events), added `onAny`, `useAnyEvent`, `createBusContext` to README API tables, added scoped context example to README, updated demo README + MILESTONES + PROJECT_CONTEXT

## v0.2.0 Milestones

12. ✅ Introspection (TDD) — 11 tests, `hasListeners`, `listenerCount`, `eventNames` on `IEventBus` interface + `EventBus` class, empty-Set cleanup on unsubscribe, update README + docs
13. ✅ React demo scaffold — `examples/react/` with Vite + React 19 + TS, event map, blank shell renders, `npm run example` script
14. ✅ State-driven components — `CartContext`, `ProductCatalog`, `CartSidebar`, Add to Cart updates cart via state + emits bus events
15. ✅ Bus-driven components — `ToastContainer`, `AnalyticsLogger`, `SearchModal`, keyboard shortcuts, toast + analytics + search all wired
16. ✅ Bus Inspector + docs — `BusInspector` panel using introspection API, `examples/react/README.md` with decision table + architecture, update root README + MILESTONES + PROJECT_CONTEXT

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
