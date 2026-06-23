import { describe, expect, it } from "vitest";
import { buildPrompt } from "../src/core/prompt-builder.js";
import { sampleBrand, sampleBrief } from "./fixtures.js";

describe("buildPrompt", () => {
  it("turns brand and brief data into a constrained product asset prompt", () => {
    const prompt = buildPrompt(sampleBrand, sampleBrief);

    expect(prompt).toContain("Create a standalone product image asset for TinyNest");
    expect(prompt).toContain("loading state");
    expect(prompt).toContain("Use one main subject only");
    expect(prompt).toContain("Do not include text");
    expect(prompt).toContain("Do not include logos");
    expect(prompt).toContain("Do not include dashboards");
  });

  it("allows text and UI mockups only when the brief allows them", () => {
    const prompt = buildPrompt(sampleBrand, {
      ...sampleBrief,
      asset: {
        ...sampleBrief.asset,
        complexity: {
          ...sampleBrief.asset.complexity,
          allow_text: true,
          allow_ui_mockups: true
        }
      }
    });

    expect(prompt).toContain("Readable text is allowed only if it directly serves the asset brief");
    expect(prompt).toContain("Simple UI mockups are allowed");
  });
});
