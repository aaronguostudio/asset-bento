# Guided Session

Use this flow when the user asks for a product image asset but does not provide a complete brand/style/brief package.

## Start

Restate the asset goal in one sentence, then inspect local context:

- Existing brand profiles: `profiles/brand/`, `brands/`
- Existing style profiles: `profiles/style/`
- Built-in styles: `presets/styles/`
- Existing briefs: `briefs/`
- Existing outputs: `outputs/`

Do not ask the user for information you can infer from existing files.

## Questions

Ask one compact question at a time. Use this order:

1. Brand/profile: "Should I use `<profile>` or create a new brand profile?"
2. Style: recommend 2-3 presets or ask for a custom direction.
3. Asset direction: type, main subject, mood, and any must-avoid elements.
4. Output: variation count, aspect ratio, sizes, and formats.
5. Run/iterate: generate, review, then export/package.

## Saving State

When enough information exists, save a session file:

```yaml
session:
  id: 2026-06-22-tinynest-loading
  created_at: "2026-06-22T20:00:00.000Z"
  status: brief-ready
  user_request: Make a premium but friendly loading asset for TinyNest.
  brand_profile: profiles/brand/tinynest.yaml
  style_profile: profiles/style/premium-minimal.yaml
  brief: briefs/tinynest-loading.yaml
  output: outputs/tinynest-loading
  answers:
    asset_type: loading
    mood: premium but friendly
    variations: 4
  next_action: Run abento generate with 4 variations.
```

Use statuses: `intake`, `profile-ready`, `brief-ready`, `generated`, `selected`, `packaged`.

## Review Heuristics

After generation, evaluate images for:

- Brand alignment
- Product UI usefulness
- Consistency with selected style profile
- No readable text unless explicitly allowed
- No logo recreation
- No clutter
- Small-size legibility for icons
- Suitable background and shadows for web use

Ask the user to choose a variation unless the task explicitly authorizes you to pick.
