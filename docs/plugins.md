# Plugin Distribution

Asset Bento is packaged as both a Codex plugin and a Claude Code plugin while keeping one canonical skill at `skills/asset-bento/SKILL.md`.

## Layout

```text
asset-bento/
├── .codex-plugin/
│   └── plugin.json
├── .claude-plugin/
│   └── plugin.json
├── .agents/
│   ├── plugins/
│   │   └── marketplace.json
│   └── skills/
│       └── asset-bento/
├── .claude/
│   └── skills/
│       └── asset-bento/
└── skills/
    └── asset-bento/
        └── SKILL.md
```

Only the manifests belong inside `.codex-plugin/` and `.claude-plugin/`. The `skills/` directory stays at the repository root so both plugin shells load the same workflow.

## Codex Local Install

This repository includes `.agents/plugins/marketplace.json` as a repo-scoped marketplace for local testing.

From the repository root:

```bash
codex plugin marketplace add ./.
```

Then restart Codex, open Plugins, select `Asset Bento Local`, and install `Asset Bento`.

The Codex plugin manifest is `.codex-plugin/plugin.json`. It points `skills` to `./skills/`, uses existing image assets for plugin presentation, and does not declare lifecycle hooks.

## Claude Code Local Install

From the repository root:

```bash
claude --plugin-dir .
```

Claude Code loads `.claude-plugin/plugin.json` and the root-level `skills/` directory. The skill is namespaced by the plugin name, so explicit invocation uses:

```text
/asset-bento:asset-bento Help me make a premium but friendly loading asset for TinyNest.
```

Run `/reload-plugins` inside Claude Code after changing plugin files during a local test session.

## Validation

Run the focused plugin distribution test:

```bash
npm test -- tests/plugin-distribution.test.ts
```

Before shipping a plugin distribution change, also run:

```bash
npm test
npm run lint
npm run build
```

Tests must not call external image APIs. Use mock providers or fixture images for any generation behavior.

## Metadata Updates

When changing plugin metadata, keep these files aligned:

- `package.json`
- `.codex-plugin/plugin.json`
- `.claude-plugin/plugin.json`
- `.agents/plugins/marketplace.json`
- `README.md`

The plugin distribution tests verify version, paths, packaged files, and user-facing install documentation so drift is caught during normal test runs.
