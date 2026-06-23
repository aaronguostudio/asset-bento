import { describe, expect, it } from "vitest";
import { createAssetBrief } from "../src/commands/brief.js";
import { createStarterBrandProfile } from "../src/commands/init-brand.js";

describe("command helpers", () => {
  it("creates an Asset Bento starter brand profile", () => {
    const profile = createStarterBrandProfile("TinyNest");

    expect(profile.brand.name).toBe("TinyNest");
    expect(profile.brand.constraints.no_text_in_images).toBe(true);
    expect(profile.brand.constraints.prefer_white_background).toBe(true);
  });

  it("creates a minimal asset brief with the linked brand profile path", () => {
    const brief = createAssetBrief({
      brandPath: "./brand-profile.yaml",
      name: "tn-loading-duo",
      type: "loading",
      complexity: "minimal"
    });

    expect(brief.brand_profile).toBe("./brand-profile.yaml");
    expect(brief.asset.name).toBe("tn-loading-duo");
    expect(brief.asset.complexity.main_elements).toBe(1);
    expect(brief.asset.complexity.accent_elements).toBe(2);
    expect(brief.asset.background.mode).toBe("white");
  });

  it("stores the brand profile path relative to the brief file when an output path is provided", () => {
    const brief = createAssetBrief({
      brandPath: "./brands/sample-product.yaml",
      outPath: "./briefs/sample-loading-asset.yaml",
      name: "sample-loading-asset",
      type: "loading",
      complexity: "minimal"
    });

    expect(brief.brand_profile).toBe("../brands/sample-product.yaml");
  });
});
