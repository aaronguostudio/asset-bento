# Asset Brief

An asset brief describes a single image asset: type, purpose, usage, background, dimensions, complexity, subject, accents, mood, and export preferences.

Briefs can be produced from a brand profile plus a style profile. Agents should prefer guided session intake over asking users to write YAML manually.

At the top level, a brief can reference reusable profiles:

```yaml
brand_profile: ../brand-profile.yaml
style_profile: ../../../presets/styles/premium-minimal.yaml
```

`abento generate` resolves both paths relative to the brief file. A `--brand` or `--style` CLI option overrides the corresponding brief reference.

The default complexity is intentionally restrained:

```yaml
complexity:
  level: minimal
  main_elements: 1
  accent_elements: 2
  allow_ui_mockups: false
  allow_text: false
```
