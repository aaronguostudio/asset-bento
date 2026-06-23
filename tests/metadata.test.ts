import { describe, expect, it } from "vitest";
import { createInitialManifest } from "../src/core/metadata.js";
import { sampleBrand, sampleBrief } from "./fixtures.js";

describe("metadata", () => {
  it("creates a manifest with brand hash, source, background, and usage", () => {
    const manifest = createInitialManifest({
      brandProfile: sampleBrand,
      brief: sampleBrief,
      model: "gpt-image-2",
      provider: "mock",
      promptFile: "./prompt.md",
      briefFile: "./brief.yaml"
    });

    expect(manifest.name).toBe("tn-loading-duo");
    expect(manifest.brand.profileHash).toMatch(/^sha256-/);
    expect(manifest.source.provider).toBe("mock");
    expect(manifest.background.mode).toBe("white");
    expect(manifest.usage).toContain("page loading");
  });
});
