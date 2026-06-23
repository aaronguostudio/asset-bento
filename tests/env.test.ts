import { describe, expect, it } from "vitest";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadDotEnv } from "../src/utils/env.js";
import { makeTempDir } from "./fixtures.js";

describe("loadDotEnv", () => {
  it("loads OPENAI_IMAGE_MODEL from a .env file without overriding existing env values", async () => {
    const dir = await makeTempDir("env");
    const envPath = path.join(dir, ".env");
    await writeFile(envPath, "OPENAI_IMAGE_MODEL=gpt-image-test\nOPENAI_API_KEY=file-key\n", "utf8");
    process.env.OPENAI_API_KEY = "existing-key";
    delete process.env.OPENAI_IMAGE_MODEL;

    loadDotEnv(envPath);

    expect(process.env.OPENAI_IMAGE_MODEL).toBe("gpt-image-test");
    expect(process.env.OPENAI_API_KEY).toBe("existing-key");
    expect(await readFile(envPath, "utf8")).toContain("OPENAI_API_KEY=file-key");
  });
});
