# Style Profiles

Style profiles are reusable visual directions for Asset Bento. They can be selected from `presets/styles/` or saved under `profiles/style/`.

Example:

```yaml
style:
  name: premium-minimal
  display_name: Premium Minimal
  description: Restrained SaaS product assets with polished materials and generous whitespace.
  visual_language:
    keywords:
      - premium SaaS
      - minimal
    materials:
      - soft ceramic
      - subtle glass
    lighting:
      - studio white light
    composition:
      - centered
      - single focal object
  defaults:
    background_mode: white
    complexity_level: minimal
    main_elements: 1
    accent_elements: 2
    allow_ui_mockups: false
    allow_text: false
  forbidden:
    - busy dashboards
    - readable text
  best_for:
    - loading
    - empty-state
```

Agents should use style profiles to guide prompts and to keep repeated asset sets visually consistent.
