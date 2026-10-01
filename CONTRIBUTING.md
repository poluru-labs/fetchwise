# Contributing

Thanks for helping with `@poluru-labs/fetchwise`. By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to contribute

- [Bug report](https://github.com/poluru-labs/fetchwise/issues/new/choose), feature, or docs issue
- Pull request that fixes an issue or improves examples
- Review and discussion on existing PRs

Questions belong in [Discussions](https://github.com/poluru-labs/fetchwise/discussions). Security reports go through [SECURITY.md](SECURITY.md), not public issues.

Search existing issues and pull requests before opening a new one. For anything larger than a small fix, open an issue first so we can agree on the approach.

## Development setup

You need Node.js 18 or later (CI runs 18, 20, and 22).

```bash
git clone https://github.com/poluru-labs/fetchwise.git
cd fetchwise
npm install
npm test
npm run typecheck
npm run build
```

| Command | What it does |
| --- | --- |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Re-run tests on change |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | ESM, CJS, and browser bundles |
| `npm run example examples/typescript/basic.ts` | Run a local example |

The library lives in `src/`. Tests are in `tests/`. Copy-paste examples are in `examples/`. Keep Node-only APIs out of `src/` except `src/cli.ts`.

## Pull requests

1. Fork the repo and create a branch from `main`.
2. Keep the change focused. Prefer one concern per PR.
3. Add or update tests for behavior changes.
4. Update the README or `examples/` when the public API or usage changes.
5. Make sure this passes locally:

```bash
npm test && npm run typecheck && npm run build
```

6. Open a PR against `main` and fill in the PR template. Link the issue if there is one.

CI must stay green. We may ask for changes before merging.

### Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add Retry-After support
fix: do not retry aborted requests
docs: clarify multi-host baseURL
test: cover named baseURL overrides
chore: bump typescript
```

Common types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`.

## License

Contributions are licensed under the same [MIT License](LICENSE) as the rest of the project. You keep copyright on your work; you grant this project the right to use it under MIT.
