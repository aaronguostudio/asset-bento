# Release Notes

## v0.1.0 - 2026-06-22

Asset Bento is now available as an open-source agent-first workflow for creating product-ready image assets.

### Highlights

- Added the `asset-bento` skill workflow for guiding product asset sessions from natural-language intent to reusable briefs and generated outputs.
- Added the `abento` CLI with commands for brand setup, brief creation, validation, generation, export, packaging, and loading animation wrappers.
- Added reusable brand, style, and session profile conventions for repeatable visual systems.
- Added built-in style presets including `premium-minimal`, `soft-glass`, `friendly-clay`, `clean-saas-3d`, `flat-product-icon`, and `playful-mascot-lite`.
- Added repo-scoped adapters for Codex and Claude Code while keeping `skills/asset-bento/SKILL.md` as the canonical workflow.
- Added public TinyNest examples for safe demo usage.
- Added dotenv loading so local `.env` files work without overriding shell environment variables.
- Added the first Asset Bento brand mark for the README and project presentation.

### Notes

- Live image generation currently requires `OPENAI_API_KEY`.
- A no-API guided mode is planned so agents can create profiles, briefs, and prompts while using hosted image tools or manual upload flows for generation.
- Tests use mock providers and fixture-style logic; they do not call external image APIs.
