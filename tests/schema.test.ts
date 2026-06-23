import { describe, expect, it } from "vitest";
import { BrandProfileSchema } from "../src/schemas/brand-profile.schema.js";
import { AssetBriefSchema } from "../src/schemas/asset-brief.schema.js";
import { sampleBrand, sampleBrief } from "./fixtures.js";

describe("schemas", () => {
  it("accepts a brand profile with visual language and constraints", () => {
    const parsed = BrandProfileSchema.parse(sampleBrand);

    expect(parsed.brand.name).toBe("TinyNest");
    expect(parsed.brand.constraints.no_text_in_images).toBe(true);
  });

  it("accepts a constrained loading asset brief", () => {
    const parsed = AssetBriefSchema.parse(sampleBrief);

    expect(parsed.asset.type).toBe("loading");
    expect(parsed.asset.complexity.main_elements).toBe(1);
  });

  it("rejects unsupported asset types", () => {
    expect(() =>
      AssetBriefSchema.parse({
        asset: {
          ...sampleBrief.asset,
          type: "splash-screen"
        }
      })
    ).toThrow();
  });
});
