# Guided Sessions

Guided sessions make Asset Bento agent-first. The agent should ask only for missing information, save reusable profiles, create a brief, generate variations, and help the user choose/export.

Recommended folders:

```text
profiles/brand/
profiles/style/
presets/styles/
sessions/
```

Session records can be saved as YAML:

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
