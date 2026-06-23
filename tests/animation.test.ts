import { describe, expect, it } from "vitest";
import path from "node:path";
import { readFile, stat } from "node:fs/promises";
import { createOrbitAnimation } from "../src/core/animation.js";
import { makeFixturePng, makeTempDir } from "./fixtures.js";

describe("createOrbitAnimation", () => {
  it("creates a CSS and React loading wrapper with reduced-motion support", async () => {
    const dir = await makeTempDir("animation");
    const input = path.join(dir, "original.png");
    const out = path.join(dir, "animation");
    await makeFixturePng(input);

    await createOrbitAnimation({
      input,
      out,
      assetName: "tn-loading-duo"
    });

    const css = await readFile(path.join(out, "loading-duo.css"), "utf8");
    expect(css).toContain("prefers-reduced-motion");
    await expect(stat(path.join(out, "LoadingDuo.tsx"))).resolves.toMatchObject({ size: expect.any(Number) });
    await expect(stat(path.join(out, "loading-duo.svg"))).resolves.toMatchObject({ size: expect.any(Number) });
  });
});
