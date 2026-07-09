import type { Command } from "commander";
import { access } from "node:fs/promises";
import path from "node:path";
import { AssetBriefSchema, ExportFormatSchema, type ExportFormat } from "../schemas/asset-brief.schema.js";
import { exportImage } from "../core/exporter.js";
import { loadDataFile } from "../utils/fs.js";

const defaultSizes = [128, 256, 512, 1024];
const defaultFormats: ExportFormat[] = ["png", "webp"];

type ExportPlanOptions = {
  input?: string;
  asset?: string;
  brief?: string;
  sizes?: string;
  formats?: string;
  webpQuality?: string;
  out?: string;
  basename?: string;
};

function parseCsvNumbers(value: string) {
  return value.split(",").map((item) => Number.parseInt(item.trim(), 10));
}

function parseFormats(value: string) {
  return value.split(",").map((item) => ExportFormatSchema.parse(item.trim()));
}

async function pathExists(target: string) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function findOriginalImage(assetPath: string) {
  for (const filename of ["original.png", "original.webp", "original.jpg", "original.jpeg"]) {
    const candidate = path.join(assetPath, filename);
    if (await pathExists(candidate)) {
      return candidate;
    }
  }

  throw new Error(`No original image found in ${assetPath}. Expected original.png, original.webp, original.jpg, or original.jpeg.`);
}

export async function createExportPlan(options: ExportPlanOptions) {
  const input = options.input ?? (options.asset ? await findOriginalImage(options.asset) : undefined);

  if (!input) {
    throw new Error("Pass --input or --asset.");
  }

  const briefPath =
    options.brief ??
    (options.asset && (await pathExists(path.join(options.asset, "brief.yaml"))) ? path.join(options.asset, "brief.yaml") : undefined);
  const brief = briefPath ? await loadDataFile(briefPath, AssetBriefSchema) : undefined;
  const out = options.out ?? (options.asset ? path.join(options.asset, "export") : undefined);

  if (!out) {
    throw new Error("Pass --out when exporting from --input without --asset.");
  }

  return {
    input,
    out,
    basename: options.basename ?? brief?.asset.name ?? path.basename(input, path.extname(input)),
    sizes: options.sizes ? parseCsvNumbers(options.sizes) : brief?.asset.dimensions.target_sizes ?? defaultSizes,
    formats: options.formats ? parseFormats(options.formats) : brief?.asset.export.formats ?? defaultFormats,
    webpQuality: options.webpQuality ? Number.parseInt(options.webpQuality, 10) : brief?.asset.export.webp_quality ?? 82
  };
}

export function registerExportCommand(program: Command) {
  program
    .command("export")
    .description("Resize and export a generated asset to web-ready formats.")
    .option("--input <path>", "Input image path")
    .option("--asset <path>", "Generated asset variation folder")
    .option("--brief <path>", "Asset brief YAML path for export defaults")
    .option("--sizes <csv>", "Comma-separated sizes")
    .option("--formats <csv>", "Comma-separated formats")
    .option("--webp-quality <number>", "WebP/JPEG quality")
    .option("--out <path>", "Output directory")
    .option("--basename <name>", "Asset basename")
    .action(async (options: ExportPlanOptions) => {
      const plan = await createExportPlan(options);
      await exportImage(plan);
      console.log(`Exported ${plan.out}`);
    });
}
