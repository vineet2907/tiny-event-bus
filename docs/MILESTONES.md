# Milestones

See [ARCHIVE.md](ARCHIVE.md) for older milestones.

## v0.6.0 Milestones

30. ✅ EditorConfig — `.editorconfig` at workspace root codifying existing conventions (2-space indent, UTF-8, LF, trim trailing whitespace, final newline), MD override for trailing whitespace, update AGENTS.md
31. ✅ ESLint 9 + Prettier — flat config with `typescript-eslint` + `eslint-config-prettier` + `react-hooks` plugin, `.prettierrc` + `.prettierignore`, root scripts (`lint`, `lint:fix`, `format`, `format:check`), lint gates build, fix all existing violations, update AGENTS.md
32. ✅ Test coverage — `@vitest/coverage-v8`, 90% thresholds (lines/branches/functions/statements), `lcov` reporter for future Codecov, `test:coverage` scripts, `coverage/` in `.gitignore`, 100% coverage across both packages, update AGENTS.md

## v0.7.0 Milestones

33. ✅ GitHub Actions CI workflow — `.github/workflows/ci.yml`, triggers on push to `main` + PRs, Node 22, single job: lint, format check, typecheck, build packages + example, test with coverage (90% thresholds enforced), update AGENTS.md + README.md
34. ✅ Coverage badge generation — added `json-summary` reporter to vitest configs, `scripts/lib/coverage-badge.mjs` (pure functions: discover, parse, average, badge SVG, 17 unit tests), `scripts/generate-coverage-badge.mjs` runner, `badges/coverage.svg`, pre-push hook auto-commits badge, CI verifies badge is up to date, `prepare` script sets `core.hooksPath`, update AGENTS.md
35. ✅ README badges — added CI status + coverage badge images to README.md, final AGENTS.md review (updated test coverage description, verified project structure), update MILESTONES.md

## Future backlog

- evaluate react-hooks/refs rule for render-time ref assignment pattern in useEvent/useAnyEvent
- event replay support as plugin
- integrate renovate to auto update dependencies
- Debug/DevTools mode
- generic `useEventBus` — dynamically return stable refs for all methods on any bus type (queued for first feature plugin)
- `onceAny` — fire catch-all handler only once then auto-unsubscribe

Architecture supports all without breaking changes.
