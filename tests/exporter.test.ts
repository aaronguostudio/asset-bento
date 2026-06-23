import { describe, expect, it } from "vitest";
import path from "node:path";
import { stat } from "node:fs/promises";
import { exportImage } from "../src/core/exporter.js";
import { makeFixturePng, makeTempDir } from "./fixtures.js";

describe("exportImage", () => {
  it("exports requested PNG and WebP sizes and returns metadata", async () => {
    const dir = await makeTempDir("exporter");
    const input = path.join(dir, "original.png");
    const out = path.join(dir, "export");
    await makeFixturePng(input);

    const manifest = await exportImage({
      input,
      out,
      basename: "tn-loading-duo",
      sizes: [32, 64],
      formats: ["png", "webp"],
      webpQuality: 82
    });

    expect(manifest.exports).toHaveLength(4);
    expect(manifest.exports.map((entry) => path.basename(entry.path))).toContain("tn-loading-duo@64.webp");
    await expect(stat(path.join(out, "tn-loading-duo@32.png"))).resolves.toMatchObject({ size: expect.any(Number) });
  });
});
