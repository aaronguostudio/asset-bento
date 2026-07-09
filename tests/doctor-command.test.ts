import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createDoctorReport, formatDoctorReport } from "../src/commands/doctor.js";
import { makeTempDir } from "./fixtures.js";

describe("doctor command", () => {
  it("checks the built-in quickstart assets without requiring an API key", async () => {
    const report = await createDoctorReport({ cwd: process.cwd(), env: {} });

    expect(report.status).toBe("warn");
    expect(report.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "sample-brand", status: "pass" }),
        expect.objectContaining({ id: "sample-brief", status: "pass" }),
        expect.objectContaining({ id: "style-presets", status: "pass" }),
        expect.objectContaining({ id: "openai-api-key", status: "warn" })
      ])
    );
    expect(report.nextSteps[0]).toBe("abento generate --brief ./examples/tinynest-style/briefs/loading-duo.yaml --dry-run");
  });

  it("can fail when API key presence is required", async () => {
    const report = await createDoctorReport({ cwd: process.cwd(), env: {}, requireApiKey: true });

    expect(report.status).toBe("fail");
    expect(report.checks).toContainEqual(
      expect.objectContaining({
        id: "openai-api-key",
        status: "fail"
      })
    );
  });

  it("reports missing quickstart assets", async () => {
    const dir = await makeTempDir("doctor-missing-assets");
    await mkdir(path.join(dir, "examples"), { recursive: true });

    const report = await createDoctorReport({ cwd: dir, env: { OPENAI_API_KEY: "set" } });

    expect(report.status).toBe("fail");
    expect(report.checks).toContainEqual(
      expect.objectContaining({
        id: "sample-brand",
        status: "fail"
      })
    );
  });

  it("formats a concise human-readable setup report", async () => {
    const report = await createDoctorReport({ cwd: process.cwd(), env: {} });
    const output = formatDoctorReport(report);

    expect(output).toContain("Asset Bento doctor");
    expect(output).toContain("[pass] Sample brand profile");
    expect(output).toContain("[warn] OpenAI API key");
    expect(output).toContain("abento generate --brief ./examples/tinynest-style/briefs/loading-duo.yaml --dry-run");
    expect(output).not.toContain("sk-");
  });

  it("surfaces invalid style presets", async () => {
    const dir = await makeTempDir("doctor-invalid-style");
    await mkdir(path.join(dir, "examples", "tinynest-style", "briefs"), { recursive: true });
    await mkdir(path.join(dir, "presets", "styles"), { recursive: true });
    await writeFile(path.join(dir, "examples", "tinynest-style", "brand-profile.yaml"), "brand:\n  name: TinyNest\n", "utf8");
    await writeFile(path.join(dir, "examples", "tinynest-style", "briefs", "loading-duo.yaml"), "asset:\n  name: broken\n", "utf8");
    await writeFile(path.join(dir, "presets", "styles", "broken.yaml"), "style:\n  name: Not Valid\n", "utf8");

    const report = await createDoctorReport({ cwd: dir, env: { OPENAI_API_KEY: "set" } });

    expect(report.checks).toContainEqual(
      expect.objectContaining({
        id: "style-presets",
        status: "fail"
      })
    );
  });
});
