import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import { describe, expect, it } from "vitest";
import { createExportPlan, exportAsset } from "../src/commands/export.js";
import { createInitialManifest } from "../src/core/metadata.js";
import { makeFixturePng, makeTempDir, sampleBrand, sampleBrief } from "./fixtures.js";

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

  it("records generated asset exports in the top-level manifest", async () => {
    const dir = await makeTempDir("export-manifest");
    const assetDir = path.join(dir, "001");
    await mkdir(assetDir, { recursive: true });
    await makeFixturePng(path.join(assetDir, "original.png"));
    await writeFile(path.join(assetDir, "brief.yaml"), YAML.stringify(sampleBrief), "utf8");
    await writeFile(
      path.join(assetDir, "manifest.json"),
      `${JSON.stringify(
        createInitialManifest({
          brandProfile: sampleBrand,
          brief: sampleBrief,
          provider: "mock",
          model: "mock-image-model",
          promptFile: "./prompt.md",
          briefFile: "./brief.yaml"
        }),
        null,
        2
      )}\n`,
      "utf8"
    );

    await exportAsset({ asset: assetDir, sizes: "32", formats: "png" });

    const manifest = JSON.parse(await readFile(path.join(assetDir, "manifest.json"), "utf8"));

    expect(manifest.source.model).toBe("mock-image-model");
    expect(manifest.exports).toEqual([
      expect.objectContaining({
        path: path.join(assetDir, "export", "tn-loading-duo@32.png"),
        format: "png",
        width: 32,
        height: 32
      })
    ]);
  });
});
