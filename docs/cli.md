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

Useful export shortcuts:

```bash
abento export --asset ./outputs/tn-loading-duo/001
abento export --input ./outputs/tn-loading-duo/001/original.png --brief ./outputs/tn-loading-duo/001/brief.yaml --out ./outputs/tn-loading-duo/001/export
```

Use `--asset` for generated variation folders. Asset Bento finds `original.*`, reads `brief.yaml` when present, and defaults export sizes, formats, quality, basename, and output folder from that context.

Agent-first usage should prefer the guided skill workflow. The CLI remains the execution layer that agents call after they have collected brand, style, and asset intent.
