import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import { describe, expect, it } from "vitest";
import { createExportPlan } from "../src/commands/export.js";
import { makeFixturePng, makeTempDir, sampleBrief } from "./fixtures.js";

describe("export command planning", () => {
  it("uses a generated asset folder and brief defaults", async () => {
    const dir = await makeTempDir("export-plan");
    const assetDir = path.join(dir, "001");
    await mkdir(assetDir, { recursive: true });
    await makeFixturePng(path.join(assetDir, "original.png"));
    await writeFile(
      path.join(assetDir, "brief.yaml"),
      YAML.stringify({
        ...sampleBrief,
        asset: {
          ...sampleBrief.asset,
          name: "brief-loading-asset",
          dimensions: {
            ...sampleBrief.asset.dimensions,
            target_sizes: [32, 64]
          },
          export: {
            formats: ["png", "webp"],
            webp_quality: 77
          }
        }
      }),
      "utf8"
    );

    const plan = await createExportPlan({ asset: assetDir });

    expect(plan).toMatchObject({
      input: path.join(assetDir, "original.png"),
      out: path.join(assetDir, "export"),
      basename: "brief-loading-asset",
      sizes: [32, 64],
      formats: ["png", "webp"],
      webpQuality: 77
    });
  });

  it("lets CLI options override generated asset folder defaults", async () => {
    const dir = await makeTempDir("export-plan-overrides");
    const assetDir = path.join(dir, "001");
    const out = path.join(dir, "custom-export");
    await mkdir(assetDir, { recursive: true });
    await makeFixturePng(path.join(assetDir, "original.png"));
    await writeFile(path.join(assetDir, "brief.yaml"), YAML.stringify(sampleBrief), "utf8");

    const plan = await createExportPlan({
      asset: assetDir,
      out,
      basename: "manual-name",
      sizes: "24,48",
      formats: "jpeg",
      webpQuality: "60"
    });

    expect(plan).toMatchObject({
      input: path.join(assetDir, "original.png"),
      out,
      basename: "manual-name",
      sizes: [24, 48],
      formats: ["jpeg"],
      webpQuality: 60
    });
  });
});
