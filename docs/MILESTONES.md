# Milestones

See [ARCHIVE.md](ARCHIVE.md) for older milestones.

## v0.7.0 Milestones

33. ✅ GitHub Actions CI workflow — `.github/workflows/ci.yml`, triggers on push to `main` + PRs, Node 22, single job: lint, format check, typecheck, build packages + example, test with coverage (90% thresholds enforced), update AGENTS.md + README.md
34. ✅ Coverage badge generation — added `json-summary` reporter to vitest configs, `scripts/lib/coverage-badge.mjs` (pure functions: discover, parse, average, badge SVG, 17 unit tests), `scripts/generate-coverage-badge.mjs` runner, `badges/coverage.svg`, pre-push hook auto-commits badge, CI verifies badge is up to date, `prepare` script sets `core.hooksPath`, update AGENTS.md
35. ✅ README badges — added CI status + coverage badge images to README.md, final AGENTS.md review (updated test coverage description, verified project structure), update MILESTONES.md

## v0.8.0 Milestones

36. ⬜ Dependabot configuration — `.github/dependabot.yml` with `npm` ecosystem entries for all workspace directories + `github-actions` ecosystem, weekly schedule, grouping for reduced PR noise, `.github/workflows/dependabot-automerge.yml` for auto-approving + squash-merging patch/minor updates after CI passes, update AGENTS.md
37. ⬜ Gitleaks secret scanning — `.gitleaks.toml` config, `hooks/pre-commit` shell script runs gitleaks on staged changes, `gitleaks-action` CI step in `.github/workflows/ci.yml`, document local setup (`brew install gitleaks`) in README.md, update AGENTS.md
38. ⬜ Harden .gitignore + final docs — add `.env*`, `*.pem`, `*.key`, `.secrets` patterns to `.gitignore`, final AGENTS.md review (Tech Stack table, Project Structure, CI description), update MILESTONES.md

## Future backlog

- evaluate react-hooks/refs rule for render-time ref assignment pattern in useEvent/useAnyEvent
- event replay support as plugin
- Debug/DevTools mode
- generic `useEventBus` — dynamically return stable refs for all methods on any bus type (queued for first feature plugin)
- `onceAny` — fire catch-all handler only once then auto-unsubscribe

Architecture supports all without breaking changes.
