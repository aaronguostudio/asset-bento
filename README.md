# Asset Bento

<p align="center">
  <img src="assets/brand/asset-bento-readme-banner.png" alt="Asset Bento banner" width="100%" />
</p>

Agent-first product image assets for real web apps.

Asset Bento helps Codex and Claude Code turn product design intent into brand-consistent, production-ready image asset packages: reusable brand/style profiles, structured briefs, generated originals, PNG/WebP exports, metadata, alt text, and optional loading animation wrappers.

It is not just a prompt library. It is a guided workflow for common product UI assets: loading states, empty states, success states, onboarding visuals, feature-card art, and small product icons.

## Install In Codex

Asset Bento ships as a Codex plugin with its canonical skill at `skills/asset-bento/SKILL.md`.

For local development from this repository, add the repo marketplace and then install Asset Bento from the Codex plugin picker:

```bash
codex plugin marketplace add ./.
```

Then open Codex, go to Plugins, choose the `Asset Bento Local` marketplace, and install `Asset Bento`.

For Codex CLI, you can also open the plugin picker with:

```bash
codex
/plugins
```

## Install In Claude Code

Asset Bento also ships as a Claude Code plugin through `.claude-plugin/plugin.json`.

For local development from this repository, launch Claude Code with the plugin directory:

```bash
claude --plugin-dir .
```

After Claude Code starts, invoke the namespaced skill or ask naturally for a product asset:

```text
/asset-bento:asset-bento Help me make a premium but friendly loading asset for TinyNest.
```

Claude Code may also auto-select the skill when your request clearly asks for product visuals.

## Try It

Ask your agent:

```text
Help me make a premium but friendly loading asset for TinyNest.
```

The Asset Bento skill guides the session:

1. Find or create a brand profile.
2. Recommend a style preset such as `premium-minimal`, `friendly-clay`, or `soft-glass`.
3. Create a reusable style profile if the direction is custom.
4. Write a structured asset brief.
5. Generate variations through the CLI.
6. Help review, export, package, and optionally create a loading animation wrapper.

Set `OPENAI_API_KEY` before running real image generation. Tests never call the OpenAI API.

## Use The CLI

The plugin workflow is the friendly path. The CLI is the execution layer for agents and advanced users.

Install dependencies and configure local environment values:

```bash
npm install
cp .env.example .env
```

The CLI automatically loads `.env` from the current working directory without overriding shell environment variables.

Check the local setup and get safe next steps:

```bash
npm run dev -- doctor
```

Create and validate a sample brief:

```bash
npm run dev -- init-brand --name "TinyNest" --out ./examples/tinynest-style/brand-profile.yaml
npm run dev -- brief --brand ./examples/tinynest-style/brand-profile.yaml --type loading --name tn-loading-duo --complexity minimal --out ./examples/tinynest-style/briefs/loading-duo.yaml
npm run dev -- validate --brand ./examples/tinynest-style/brand-profile.yaml --brief ./examples/tinynest-style/briefs/loading-duo.yaml
```

Preview the resolved prompt, then generate with OpenAI when your API key is configured:

```bash
npm run dev -- generate --brief ./examples/tinynest-style/briefs/loading-duo.yaml --dry-run
npm run dev -- generate --brief ./examples/tinynest-style/briefs/loading-duo.yaml --variations 4 --out ./outputs/tn-loading-duo
```

Export and package:

```bash
npm run dev -- export --asset ./outputs/tn-loading-duo/001
npm run dev -- package --asset ./outputs/tn-loading-duo/001 --out ./dist/tn-loading-duo
npm run dev -- animate --input ./outputs/tn-loading-duo/001/original.png --type orbit --name tn-loading-duo --out ./dist/tn-loading-duo/animation
```

After `npm run build`, the CLI binary is `abento`.

## Built-In Style Presets

- `premium-minimal`: polished, restrained SaaS assets with generous whitespace.
- `soft-glass`: translucent glass forms and delicate reflections.
- `friendly-clay`: warm clay-like 3D shapes with approachable personality.
- `clean-saas-3d`: crisp modern 3D for SaaS feature/onboarding surfaces.
- `flat-product-icon`: simple flat icons optimized for small UI sizes.
- `playful-mascot-lite`: light mascot-inspired warmth without cartoon clutter.

## Asset Types

MVP asset types: `empty-state`, `loading`, `success`, `error`, `attention`, `onboarding`, `feature`, `team-icon`, `avatar-placeholder`, `billing`, `communication`, `learning`, and `custom`.

## Design Rules

Asset Bento defaults to restrained product assets: one main visual idea, one or two accents, no text, no logo recreation, white backgrounds, and no fake dashboards unless the brief explicitly allows UI mockups.

Transparency is supported as a brief mode, but the MVP treats white backgrounds as the default. Native transparency is sent to providers only when supported, and white-to-alpha should be considered experimental for glassy or shadow-heavy assets.

## Plugin Layout

The canonical skill lives at `skills/asset-bento/SKILL.md`.

Plugin and adapter files:

- Codex plugin manifest: `.codex-plugin/plugin.json`
- Codex local marketplace: `.agents/plugins/marketplace.json`
- Claude Code plugin manifest: `.claude-plugin/plugin.json`
- Codex repo-scoped adapter: `.agents/skills/asset-bento/SKILL.md`
- Claude Code repo-scoped adapter: `.claude/skills/asset-bento/SKILL.md`

Both plugin manifests point back to the canonical skill so the workflow remains agent-neutral.

Reusable profile folders:

- Brand profiles: `profiles/brand/`
- Style profiles: `profiles/style/`
- Built-in style presets: `presets/styles/`
- Guided session records: `sessions/`

See [plugin docs](docs/plugins.md) for local plugin validation details.

## Development

```bash
npm test
npm run lint
npm run build
npm run pack:check
```

No secrets, generated outputs, or proprietary brand assets should be committed.
