import { describe, expect, it } from "vitest";
import { exportFileName, sanitizeAssetName } from "../src/core/file-naming.js";

describe("file naming", () => {
  it("normalizes names for web asset files", () => {
    expect(sanitizeAssetName("TinyNest Loading Duo!")).toBe("tinynest-loading-duo");
  });

  it("builds size-qualified export filenames", () => {
    expect(exportFileName("tn-loading-duo", 512, "webp")).toBe("tn-loading-duo@512.webp");
  });
});
