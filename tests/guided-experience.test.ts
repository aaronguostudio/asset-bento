import { describe, expect, it } from "vitest";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import { buildPrompt } from "../src/core/prompt-builder.js";
import { GuidedSessionSchema } from "../src/schemas/guided-session.schema.js";
import { StyleProfileSchema } from "../src/schemas/style-profile.schema.js";
import { sampleBrand, sampleBrief } from "./fixtures.js";

const premiumMinimalStyle = {
  style: {
    name: "premium-minimal",
    display_name: "Premium Minimal",
    description: "Restrained SaaS product assets with polished materials and generous whitespace.",
    visual_language: {
      keywords: ["premium SaaS", "minimal", "calm"],
      materials: ["soft ceramic", "subtle glass"],
      lighting: ["studio white light", "gentle shadows"],
      composition: ["centered", "single focal object", "generous whitespace"]
    },
    defaults: {
      background_mode: "white",
      complexity_level: "minimal",
      main_elements: 1,
      accent_elements: 2,
      allow_ui_mockups: false,
      allow_text: false
    },
    forbidden: ["busy dashboards", "floating random icons", "readable text"],
    best_for: ["loading", "empty-state", "success", "feature"]
  }
};

describe("guided Asset Bento experience", () => {
  it("validates reusable style profiles", () => {
    const parsed = StyleProfileSchema.parse(premiumMinimalStyle);

    expect(parsed.style.name).toBe("premium-minimal");
    expect(parsed.style.defaults.accent_elements).toBe(2);
    expect(parsed.style.forbidden).toContain("busy dashboards");
  });

  it("validates guided session records", () => {
    const parsed = GuidedSessionSchema.parse({
      session: {
        id: "2026-06-22-tinynest-loading",
        created_at: "2026-06-22T20:00:00.000Z",
        status: "brief-ready",
        user_request: "Make a premium but friendly loading asset for TinyNest.",
        brand_profile: "profiles/brand/tinynest.yaml",
        style_profile: "profiles/style/premium-minimal.yaml",
        brief: "briefs/tinynest-loading.yaml",
        output: "outputs/tinynest-loading",
        answers: {
          product: "TinyNest",
          asset_type: "loading",
          mood: "premium but friendly",
          variations: 4
        },
        next_action: "Run abento generate with 4 variations."
      }
    });

    expect(parsed.session.status).toBe("brief-ready");
    expect(parsed.session.answers.variations).toBe(4);
  });

  it("adds style profile guidance to generated prompts", () => {
    const style = StyleProfileSchema.parse(premiumMinimalStyle);
    const prompt = buildPrompt(sampleBrand, sampleBrief, style);

    expect(prompt).toContain("Style profile: Premium Minimal");
    expect(prompt).toContain("premium SaaS");
    expect(prompt).toContain("generous whitespace");
    expect(prompt).toContain("Avoid these style-specific forbidden elements: busy dashboards");
  });

  it("validates every built-in style preset", async () => {
    const presetDir = path.resolve("presets/styles");
    const files = (await readdir(presetDir)).filter((file) => file.endsWith(".yaml"));

    expect(files.length).toBeGreaterThanOrEqual(6);

    for (const file of files) {
      const parsed = YAML.parse(await readFile(path.join(presetDir, file), "utf8"));
      const profile = StyleProfileSchema.parse(parsed);
      expect(file).toBe(`${profile.style.name}.yaml`);
    }
  });
});
