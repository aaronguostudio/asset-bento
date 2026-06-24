# Asset Bento Plugin Distribution Design

## Goal

Make Asset Bento installable as a real agent plugin for both Codex and Claude Code, so users can start from their agent's plugin flow instead of cloning the repository and learning developer commands first.

The long-term target is parity with the installation posture of Superpowers: one repository contains the canonical skills and the harness-specific plugin manifests needed by each agent environment.

## User Experience

Asset Bento should present three user paths, in this order:

1. Install in Codex.
2. Install in Claude Code.
3. Use or develop the CLI directly.

The primary user should be able to install the plugin, open a normal agent session, and ask:

```text
Help me make a premium but friendly loading asset for TinyNest.
```

The agent should load the Asset Bento skill, guide the intake, create profiles and briefs, run the CLI as needed, and help export the chosen result. The user should not need to understand `skills/`, `.agents/`, `.claude/`, YAML schema files, or `npm run dev` before they can try the workflow.

## Chosen Approach

Use a single-repository, dual-plugin-shell model.

- Keep `skills/asset-bento/SKILL.md` as the only substantive workflow.
- Add a Codex plugin manifest under `.codex-plugin/plugin.json`.
- Add a Claude plugin manifest under `.claude-plugin/plugin.json`.
- Keep existing repo-scoped adapters under `.agents/skills/asset-bento/` and `.claude/skills/asset-bento/` for local workspace discovery.
- Treat `abento` as the execution engine, not the primary user-facing installation story.

This avoids duplicating the skill, keeps the implementation close to the current repository shape, and gives both Codex and Claude Code a first-class installation target.

## Plugin Shape

The Codex plugin shell should declare:

- Plugin name, version, description, homepage, repository, license, and author.
- `skills` pointing at `./skills/`.
- Interface metadata: display name, short and long descriptions, developer name, category, capabilities, default prompts, website URL, brand color, composer icon, logo, and screenshots when available.

The Claude plugin shell should declare:

- Plugin name, version, description, homepage, repository, license, author, and keywords.
- Enough metadata for Claude Code to load the packaged skills from the repository root.

Both manifests should use package metadata where possible. If manifest data must be copied, validation should catch drift between `package.json`, `.codex-plugin/plugin.json`, and `.claude-plugin/plugin.json`.

## Hooks

Do not add session-start hooks in the first plugin distribution slice.

Superpowers uses hooks because it wants to change the agent's general software-development behavior from session start. Asset Bento is a task-specific creative production workflow. It should activate when the user asks for product image assets, not inject itself into every coding session.

Hooks can be reconsidered later for lightweight setup checks, such as warning that no image provider key is configured, but that should not be part of the first distribution pass.

## Documentation

Rewrite the top-level README so installation is user-first:

1. What Asset Bento does.
2. Install in Codex.
3. Install in Claude Code.
4. First prompt to try.
5. CLI usage for advanced users.
6. Development commands.

The README should keep developer commands, but move them below the plugin installation path. `docs/cli.md` can remain the detailed CLI reference.

Add a focused plugin document, such as `docs/plugins.md`, that explains:

- Repository plugin layout.
- Codex local install and validation flow.
- Claude Code local install and validation flow.
- How the manifests relate to the canonical skill.
- How to update version and metadata safely.

## Validation

Add automated checks that do not call external image APIs:

- Both plugin manifests are valid JSON.
- Both manifests point to existing skill paths.
- Required manifest metadata is present.
- Manifest version matches `package.json`.
- README references the intended plugin install paths.
- Existing tests, lint, and build continue to pass.

The validation should be runnable through the normal local commands:

```bash
npm test
npm run lint
npm run build
```

If a separate manifest validation script is useful, it should be wired into `npm test` or another existing script instead of becoming tribal knowledge.

## Out Of Scope

The first plugin distribution pass should not:

- Publish to npm.
- Submit to public Codex or Claude marketplaces.
- Add a web UI.
- Add a CLI wizard.
- Call external image APIs in tests.
- Add session-start hooks.
- Duplicate the canonical skill into harness-specific copies.

Marketplace submission and npm publication can follow once local plugin installation is solid and the README path has been tested by someone who did not build the project.

## Success Criteria

The work is successful when:

- A Codex user can identify the plugin install path without reading developer setup instructions.
- A Claude Code user can identify the plugin install path without reading developer setup instructions.
- The repository contains first-class `.codex-plugin` and `.claude-plugin` manifests.
- The canonical `skills/asset-bento/SKILL.md` remains the single source of workflow truth.
- Tests verify that plugin metadata and skill paths do not drift.
- The CLI remains usable for developers and agents as the execution layer.
