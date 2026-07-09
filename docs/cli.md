# CLI

Use `npm run dev -- <command>` during development and `abento <command>` after building or installing the package.

Commands:

- `init-brand`
- `brief`
- `validate`
- `generate`
- `export`
- `package`
- `animate`

Useful generation checks:

```bash
abento generate --brief ./examples/tinynest-style/briefs/loading-duo.yaml --dry-run
abento generate --brief ./examples/tinynest-style/briefs/loading-duo.yaml --style ./presets/styles/premium-minimal.yaml --dry-run
```

Use `--dry-run` to resolve brand/style references and inspect the final prompt without calling an image provider.

Agent-first usage should prefer the guided skill workflow. The CLI remains the execution layer that agents call after they have collected brand, style, and asset intent.
