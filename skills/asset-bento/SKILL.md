---
name: asset-bento
description: Guided agent workflow for creating brand-consistent, production-ready website and app image assets from natural-language requests, brand profiles, and style profiles. Use when the user asks to make or improve product visuals such as empty states, loading assets, SaaS illustrations, product icons, onboarding visuals, feature-card art, reusable branded asset systems, style explorations, prompt/brief generation, exports, metadata, alt text, or loading animation wrappers.
---

# Asset Bento

Guide users from a natural-language product asset request to a production-ready image asset package.

Default to a guided experience. Do not require the user to know YAML, CLI flags, or internal folder names.

## Guided Workflow

1. Interpret the user's asset goal from natural language.
2. Look for existing profiles before asking questions:
   - `profiles/brand/`
   - `brands/`
   - `profiles/style/`
   - `presets/styles/`
3. Ask only for missing information. Prefer one compact question at a time.
4. Recommend 2-3 style presets when the user has not specified a style.
5. Save reusable brand and style choices as YAML profiles when useful.
6. Create or update an asset brief.
7. Save a guided session record under `sessions/` for continuity.
8. Run the CLI to generate variations.
9. Help review outputs for product usability, then export/package the chosen result.

## Design Rules

- Do not create random decorative images.
- Do not overload assets with many objects.
- Do not add readable text inside images unless explicitly requested.
- Do not recreate a provided logo unless the user explicitly asks for logo work.
- Use logo/reference images only for meaning, palette, and style.
- For small icons, optimize for 24-32 px legibility.
- For product illustrations, default to white background unless transparent is explicitly requested.
- Treat transparent background as provider-dependent.
- Preserve prompt history and export metadata.

## Intake Questions

Collect these fields, but do not ask for fields that are already obvious from context:

- Brand: product name, audience, product purpose, colors, existing references, forbidden patterns.
- Style: preset or custom style profile, materials, lighting, composition, mood.
- Asset: asset type, usage surface, main subject, allowed accents, whether UI mockups or text are allowed.
- Output: aspect ratio, sizes, formats, variation count, target folder.
- Iteration: what to keep, what to avoid, which variation to export.

If the user says something broad like "make me a loading asset", ask for brand/profile first. If a brand profile already exists and matches the request, use it and ask about style or asset direction next.

## Style Presets

Use presets from `presets/styles/` as starting points:

- `premium-minimal`: polished, restrained SaaS assets with generous whitespace.
- `soft-glass`: translucent glass forms and delicate reflections.
- `friendly-clay`: warm clay-like 3D shapes with approachable personality.
- `clean-saas-3d`: crisp modern 3D for SaaS feature/onboarding surfaces.
- `flat-product-icon`: simple flat icons optimized for small UI sizes.
- `playful-mascot-lite`: light mascot-inspired warmth without cartoon clutter.

Offer 2-3 relevant presets instead of dumping the whole list. If the user creates a custom direction, save it under `profiles/style/<name>.yaml`.

## Profile And Session Files

Prefer these folders:

- Brand profiles: `profiles/brand/<name>.yaml`
- Style profiles: `profiles/style/<name>.yaml`
- Built-in style presets: `presets/styles/<name>.yaml`
- Guided sessions: `sessions/<date>-<asset-name>.yaml`
- Asset briefs: `briefs/<asset-name>.yaml`
- Outputs: `outputs/<asset-name>/`

Existing `brands/` files remain valid. Do not move user files unless asked.

## Local CLI

Use the local CLI when available:

- `abento doctor`
- `abento init-brand`
- `abento brief`
- `abento generate`
- `abento export`
- `abento package`
- `abento animate`
- `abento validate`

During development, use `npm run dev -- <command>`.

When the user asks for generation, run `npm run build` if `dist/cli.js` may be stale, then use `node dist/cli.js ...`.

If the user has not selected a variation yet, do not package blindly. Ask them to choose, or review visible outputs when image inspection is available.

## References

- Read `skills/asset-bento/references/guided-session.md` before leading a guided intake.
- Read `skills/asset-bento/references/style-presets.md` before recommending styles.
- Read `docs/brand-profile.md` for brand profiles.
- Read `docs/style-profiles.md` for reusable style profiles.
- Read `docs/guided-sessions.md` for session records.
- Read `docs/asset-brief.md` for briefs and complexity controls.
- Read `docs/transparency.md` before promising transparent backgrounds.
- Read `docs/animation.md` before creating loading wrappers.
