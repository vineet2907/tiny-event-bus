# Milestones

See [ARCHIVE.md](ARCHIVE.md) for older milestones.

## v0.10.0 Milestones

46. ✅ Package metadata & npm readiness — add `publishConfig`, `repository`, `homepage`, `bugs` to all three package.json files, set all versions to `0.10.0`, verify with `npm pack --dry-run`
47. ✅ Changesets setup — install `@changesets/cli`, `changeset init`, configure `.changeset/config.json` (public access, main branch, independent versioning, auto-patch internal deps), add root scripts (`changeset`, `version`, `release`)
48. ✅ End-to-end dry-run validation — single-package + multi-package dry-runs: create changesets → `pnpm version` → verify bumps + changelogs + peer deps → `npm publish --dry-run` → revert
49. ✅ Documentation & AGENTS.md updates — AGENTS.md (Tech Stack, Project Structure, Key Decisions), README (Releasing section with release branch workflow + git tags), MILESTONES.md, package READMEs (npm version badges)
50. ⬜ First publish to npm — manual step when ready: `npm login` + 2FA, release branch PR, `pnpm release`, `git push --tags`

## v0.11.0 Milestones

51. ✅ Middleware package scaffolding — `packages/middleware/` with `package.json` (`@tiny-event-bus/middleware`), peer dep on `@tiny-event-bus/core`, dual ESM/CJS exports, `tsconfig.json`, `tsconfig.cjs.json`, `vitest.config.ts` (90% thresholds), `src/with-middleware.ts` (`Middleware<T>`, `MiddlewarePayload<T>`, `withMiddleware` factory delegating all 8 IEventBus methods), `src/index.ts`, `README.md`, skeleton delegation tests, update AGENTS.md + README.md + PLUGIN_ARCHITECTURE.md
52. ✅ Basic emit interception — TDD: middleware is called on `emit()`, not calling `next()` blocks the event, middleware can mutate data passed to `next()`, update AGENTS.md
53. ✅ Middleware chain + error propagation — TDD: two middlewares run in insertion order, three middlewares chain correctly, blocking mid-chain stops remaining middlewares + inner bus, throwing middleware propagates error to caller + stops chain (deliberate: unlike handler errors in core, middleware errors are not swallowed), update AGENTS.md
54. ⏭️ Dynamic `use()` — skipped. All use cases (dev tooling, testing, feature flags, teardown) can be achieved by passing middleware in the initial array or recreating the bus. `use()` only adds value when the bus is a shared singleton with existing subscribers and middleware needs to be added transiently — too narrow a scenario to justify the added complexity (snapshotting, unsubscribe logic, `MiddlewareBus<T>` interface).
55. ✅ Composition + edge cases — TDD: re-entrant emit safety (middleware calling emit() gets its own independent chain via snapshotting); composition tests dropped — redundant with existing blocking test and would require cross-package devDependency violating plugin independence; update AGENTS.md + PLUGIN_ARCHITECTURE.md + middleware README
56. ✅ Example app: toast formatter — wrap `shopBus` with `withMiddleware([toastFormatter])` in `examples/react/src/events.ts`, `toastFormatter` prepends severity emoji to `toast:show` message, update example README + AGENTS.md

## Future backlog

- integration tests for plugin composition — `withMiddleware(withReplay(bus))`, `withReplay(withMiddleware(bus))`, and React hook combinations; currently no cross-package test coverage; interim: add to `packages/react/src/__tests__/integration.test.tsx`
- evaluate react-hooks/refs rule for render-time ref assignment pattern in useEvent/useAnyEvent
- Trigger CI on main after Dependabot auto-merge (GITHUB_TOKEN merges don't trigger workflows)
- GitHub Action for automated CI publish (changesets/action)
- Migration to Conventional Commits + semantic-release
- Debug/DevTools mode
- `onceAny` — fire catch-all handler only once then auto-unsubscribe
- CONTRIBUTING.md — release workflow, branching strategy, changeset instructions (move from AGENTS.md Key Decisions)

Architecture supports all without breaking changes.
