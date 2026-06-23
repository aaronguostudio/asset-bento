# Agent Skill

The canonical Asset Bento skill is `skills/asset-bento/SKILL.md`. It should behave as a guided workflow, not a raw CLI wrapper.

Codex adapter: `.agents/skills/asset-bento/SKILL.md`.

Claude Code adapter: `.claude/skills/asset-bento/SKILL.md`.

Keep substantive workflow instructions in the canonical skill and keep adapters short.

The agent should ask for missing brand/style/asset information, recommend style presets, save reusable profiles, create a brief, and only then call the CLI.
