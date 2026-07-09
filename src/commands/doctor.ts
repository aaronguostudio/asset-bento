import type { Command } from "commander";
import { readdir } from "node:fs/promises";
import path from "node:path";
import type { ZodType } from "zod";
import { AssetBriefSchema } from "../schemas/asset-brief.schema.js";
import { BrandProfileSchema } from "../schemas/brand-profile.schema.js";
import { StyleProfileSchema } from "../schemas/style-profile.schema.js";
import { loadDataFile } from "../utils/fs.js";

export type DoctorStatus = "pass" | "warn" | "fail";

export type DoctorCheck = {
  id: string;
  label: string;
  status: DoctorStatus;
  detail: string;
};

export type DoctorReport = {
  status: DoctorStatus;
  checks: DoctorCheck[];
  nextSteps: string[];
};

type DoctorOptions = {
  cwd?: string;
  env?: Record<string, string | undefined>;
  requireApiKey?: boolean;
};

const sampleBrandPath = "./examples/tinynest-style/brand-profile.yaml";
const sampleBriefPath = "./examples/tinynest-style/briefs/loading-duo.yaml";
const stylePresetsPath = "./presets/styles";
const minimumNodeMajor = 20;

function errorDetail(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function createCheck(id: string, label: string, status: DoctorStatus, detail: string): DoctorCheck {
  return { id, label, status, detail };
}

function checkNodeVersion() {
  const major = Number.parseInt(process.versions.node.split(".")[0] ?? "0", 10);
  const status: DoctorStatus = major >= minimumNodeMajor ? "pass" : "fail";

  return createCheck(
    "node",
    "Node.js",
    status,
    status === "pass"
      ? `Node ${process.versions.node} satisfies >=${minimumNodeMajor}.`
      : `Node ${process.versions.node} is below >=${minimumNodeMajor}.`
  );
}

async function checkDataFile<T>(cwd: string, id: string, label: string, relativePath: string, schema: ZodType<T>) {
  try {
    await loadDataFile(path.join(cwd, relativePath), schema);
    return createCheck(id, label, "pass", `${relativePath} is valid.`);
  } catch (error) {
    return createCheck(id, label, "fail", `${relativePath}: ${errorDetail(error)}`);
  }
}

async function checkStylePresets(cwd: string) {
  const presetsDir = path.join(cwd, stylePresetsPath);

  try {
    const filenames = (await readdir(presetsDir)).filter((filename) => filename.endsWith(".yaml") || filename.endsWith(".yml")).sort();

    if (!filenames.length) {
      return createCheck("style-presets", "Style presets", "fail", `${stylePresetsPath} has no YAML presets.`);
    }

    const invalid: string[] = [];

    for (const filename of filenames) {
      try {
        await loadDataFile(path.join(presetsDir, filename), StyleProfileSchema);
      } catch {
        invalid.push(filename);
      }
    }

    if (invalid.length) {
      return createCheck(
        "style-presets",
        "Style presets",
        "fail",
        `${invalid.length}/${filenames.length} preset files are invalid: ${invalid.join(", ")}.`
      );
    }

    return createCheck("style-presets", "Style presets", "pass", `${filenames.length} preset files are valid.`);
  } catch (error) {
    return createCheck("style-presets", "Style presets", "fail", `${stylePresetsPath}: ${errorDetail(error)}`);
  }
}

function checkOpenAiKey(env: Record<string, string | undefined>, requireApiKey: boolean) {
  const hasKey = Boolean(env.OPENAI_API_KEY?.trim());

  if (hasKey) {
    return createCheck("openai-api-key", "OpenAI API key", "pass", "OPENAI_API_KEY is set.");
  }

  return createCheck(
    "openai-api-key",
    "OpenAI API key",
    requireApiKey ? "fail" : "warn",
    "OPENAI_API_KEY is not set. Dry runs still work; real generation needs a key."
  );
}

function summarizeStatus(checks: DoctorCheck[]) {
  if (checks.some((check) => check.status === "fail")) {
    return "fail";
  }

  if (checks.some((check) => check.status === "warn")) {
    return "warn";
  }

  return "pass";
}

export async function createDoctorReport(options: DoctorOptions = {}): Promise<DoctorReport> {
  const cwd = options.cwd ?? process.cwd();
  const env = options.env ?? process.env;
  const requireApiKey = options.requireApiKey ?? false;
  const checks = [
    checkNodeVersion(),
    await checkDataFile(cwd, "sample-brand", "Sample brand profile", sampleBrandPath, BrandProfileSchema),
    await checkDataFile(cwd, "sample-brief", "Sample asset brief", sampleBriefPath, AssetBriefSchema),
    await checkStylePresets(cwd),
    checkOpenAiKey(env, requireApiKey)
  ];

  return {
    status: summarizeStatus(checks),
    checks,
    nextSteps: [
      `abento generate --brief ${sampleBriefPath} --dry-run`,
      `abento generate --brief ${sampleBriefPath} --variations 4 --out ./outputs/tn-loading-duo`,
      "abento export --asset ./outputs/tn-loading-duo/001"
    ]
  };
}

export function formatDoctorReport(report: DoctorReport) {
  const lines = ["Asset Bento doctor", `Status: ${report.status}`, ""];

  for (const check of report.checks) {
    lines.push(`[${check.status}] ${check.label}`);
    lines.push(`  ${check.detail}`);
  }

  lines.push("", "Next steps:");
  report.nextSteps.forEach((step, index) => {
    lines.push(`${index + 1}. ${step}`);
  });

  return lines.join("\n");
}

export function registerDoctorCommand(program: Command) {
  program
    .command("doctor")
    .description("Check local setup and print safe Asset Bento next steps.")
    .option("--json", "Print a JSON report")
    .option("--require-api-key", "Fail when OPENAI_API_KEY is missing")
    .action(async (options: { json?: boolean; requireApiKey?: boolean }) => {
      const report = await createDoctorReport({ requireApiKey: options.requireApiKey });

      if (options.json) {
        console.log(JSON.stringify(report, null, 2));
      } else {
        console.log(formatDoctorReport(report));
      }

      if (report.status === "fail") {
        process.exitCode = 1;
      }
    });
}
