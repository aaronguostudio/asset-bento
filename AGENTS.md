# Agent Rules

This repository builds **Asset Bento**, an open-source skill and CLI for generating product-ready image asset packages.

Use `skills/asset-bento/SKILL.md` as the canonical workflow. The `.agents/skills/asset-bento` and `.claude/skills/asset-bento` directories are repo-scoped adapters for different agents.

## Local Commands

```bash
npm test
npm run lint
npm run build
```

Do not call external image APIs in tests. Use mock providers or fixture images.

Never log `OPENAI_API_KEY`, and do not commit `.env`, generated outputs, or proprietary brand assets.
