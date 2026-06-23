import type { Command } from "commander";
import path from "node:path";
import { ExportFormatSchema } from "../schemas/asset-brief.schema.js";
import { exportImage } from "../core/exporter.js";

function parseCsvNumbers(value: string) {
  return value.split(",").map((item) => Number.parseInt(item.trim(), 10));
}

function parseFormats(value: string) {
  return value.split(",").map((item) => ExportFormatSchema.parse(item.trim()));
}

export function registerExportCommand(program: Command) {
  program
    .command("export")
    .description("Resize and export a generated asset to web-ready formats.")
    .requiredOption("--input <path>", "Input image path")
    .option("--sizes <csv>", "Comma-separated sizes", "128,256,512,1024")
    .option("--formats <csv>", "Comma-separated formats", "png,webp")
    .option("--webp-quality <number>", "WebP/JPEG quality", "82")
    .requiredOption("--out <path>", "Output directory")
    .option("--basename <name>", "Asset basename")
    .action(async (options: { input: string; sizes: string; formats: string; webpQuality: string; out: string; basename?: string }) => {
      const basename = options.basename ?? path.basename(options.input, path.extname(options.input));
      await exportImage({
        input: options.input,
        out: options.out,
        basename,
        sizes: parseCsvNumbers(options.sizes),
        formats: parseFormats(options.formats),
        webpQuality: Number.parseInt(options.webpQuality, 10)
      });
      console.log(`Exported ${options.out}`);
    });
}
