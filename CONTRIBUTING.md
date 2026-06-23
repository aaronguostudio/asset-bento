# Contributing

Thanks for helping improve Asset Bento.

## Development

```bash
npm ci
npm test
npm run lint
npm run build
```

Tests must not call external image APIs. Use injected providers, fixtures, or local images.

## Pull Requests

- Keep changes focused.
- Add or update tests for behavior changes.
- Do not commit `.env`, generated outputs, proprietary brand assets, or private session files.
- Keep the canonical skill at `skills/asset-bento/SKILL.md` agent-neutral. Codex and Claude adapters should stay short and point back to the canonical skill.

## Profiles And Examples

Use generic sample brands in public examples. Real customer or product brand profiles should stay local.
