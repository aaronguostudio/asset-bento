import { writeFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import { describe, expect, it } from "vitest";
import {
  createGeneratePlan,
  formatGenerateDryRun,
} from "../src/commands/generate.js";
import { makeTempDir, sampleBrand, sampleBrief } from "./fixtures.js";

const premiumMinimalStyle = {
  style: {
    name: "premium-minimal",
    display_name: "Premium Minimal",
    description:
      "Restrained SaaS product assets with polished materials and generous whitespace.",
    visual_language: {
      keywords: ["premium SaaS", "minimal"],
      materials: ["soft ceramic"],
      lighting: ["studio white light"],
      composition: ["centered", "generous whitespace"],
    },
    defaults: {
      background_mode: "white",
      complexity_level: "minimal",
      main_elements: 1,
      accent_elements: 2,
      allow_ui_mockups: false,
      allow_text: false,
    },
    forbidden: ["busy dashboards", "readable text"],
    best_for: ["loading"],
  },
};

describe("generate command planning", () => {
  it("loads a style profile referenced by the asset brief", async () => {
    const dir = await makeTempDir("generate-plan");
    const brandPath = path.join(dir, "brand.yaml");
    const stylePath = path.join(dir, "style.yaml");
    const briefPath = path.join(dir, "brief.yaml");

    await writeFile(brandPath, YAML.stringify(sampleBrand), "utf8");
    await writeFile(stylePath, YAML.stringify(premiumMinimalStyle), "utf8");
    await writeFile(
      briefPath,
      YAML.stringify({
        ...sampleBrief,
        brand_profile: "./brand.yaml",
        style_profile: "./style.yaml",
      }),
      "utf8",
    );

    const plan = await createGeneratePlan({
      brief: briefPath,
      variations: "2",
    });

    expect(plan.brandPath).toBe(brandPath);
    expect(plan.stylePath).toBe(stylePath);
    expect(plan.variations).toBe(2);
    expect(plan.prompt).toContain("Style profile: Premium Minimal");
    expect(plan.prompt).toContain("generous whitespace");
  });

  it("formats a dry run without provider-specific output", async () => {
    const dir = await makeTempDir("generate-dry-run");
    const brandPath = path.join(dir, "brand.yaml");
    const stylePath = path.join(dir, "style.yaml");
    const briefPath = path.join(dir, "brief.yaml");

    await writeFile(brandPath, YAML.stringify(sampleBrand), "utf8");
    await writeFile(stylePath, YAML.stringify(premiumMinimalStyle), "utf8");
    await writeFile(
      briefPath,
      YAML.stringify({
        ...sampleBrief,
        brand_profile: "./brand.yaml",
      }),
      "utf8",
    );

    const plan = await createGeneratePlan({
      brief: briefPath,
      style: stylePath,
      model: "mock-image-model",
    });
    const dryRun = formatGenerateDryRun(plan);

    expect(dryRun).toContain("Asset Bento generate dry run");
    expect(dryRun).toContain(`Brief: ${briefPath}`);
    expect(dryRun).toContain(`Brand: ${brandPath}`);
    expect(dryRun).toContain(`Style: ${stylePath}`);
    expect(dryRun).toContain("Model: mock-image-model");
    expect(dryRun).toContain("Prompt:");
    expect(dryRun).toContain("Style profile: Premium Minimal");
  });
});
