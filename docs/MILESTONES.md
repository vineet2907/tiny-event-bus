# Milestones

See [ARCHIVE.md](ARCHIVE.md) for older milestones.

## v0.6.0 Milestones

30. ✅ EditorConfig — `.editorconfig` at workspace root codifying existing conventions (2-space indent, UTF-8, LF, trim trailing whitespace, final newline), MD override for trailing whitespace, update AGENTS.md
31. ✅ ESLint 9 + Prettier — flat config with `typescript-eslint` + `eslint-config-prettier` + `react-hooks` plugin, `.prettierrc` + `.prettierignore`, root scripts (`lint`, `lint:fix`, `format`, `format:check`), lint gates build, fix all existing violations, update AGENTS.md
32. ✅ Test coverage — `@vitest/coverage-v8`, 90% thresholds (lines/branches/functions/statements), `lcov` reporter for future Codecov, `test:coverage` scripts, `coverage/` in `.gitignore`, 100% coverage across both packages, update AGENTS.md

## v0.7.0 Milestones

33. ✅ GitHub Actions CI workflow — `.github/workflows/ci.yml`, triggers on push to `main` + PRs, Node 22, single job: lint, format check, typecheck, build packages + example, test with coverage (90% thresholds enforced), update AGENTS.md + README.md
34. ⬜ Coverage badge generation — add `json-summary` reporter to vitest configs, `scripts/generate-coverage-badge.mjs` (zero-dep, reads coverage JSON, writes SVG), `badges/` directory, CI auto-commits badge on push to main (Node 22 only), update AGENTS.md + README.md
35. ⬜ README badges — add CI status + coverage badge images to README.md top, final AGENTS.md review, update MILESTONES.md

## Future backlog

- evaluate react-hooks/refs rule for render-time ref assignment pattern in useEvent/useAnyEvent
- event replay support as plugin
- integrate renovate to auto update dependencies
- Debug/DevTools mode
- generic `useEventBus` — dynamically return stable refs for all methods on any bus type (queued for first feature plugin)
- `onceAny` — fire catch-all handler only once then auto-unsubscribe

Architecture supports all without breaking changes.
