import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { ExportFormat } from "../schemas/asset-brief.schema.js";
import { exportFileName, sanitizeAssetName } from "./file-naming.js";

type ExportImageOptions = {
  input: string;
  out: string;
  basename: string;
  sizes: number[];
  formats: ExportFormat[];
  webpQuality: number;
};

type ExportEntry = {
  path: string;
  format: ExportFormat;
  width: number;
  height: number;
  quality?: number;
  bytes: number;
};

export async function exportImage(options: ExportImageOptions) {
  await mkdir(options.out, { recursive: true });
  const basename = sanitizeAssetName(options.basename);
  const exports: ExportEntry[] = [];

  for (const size of options.sizes) {
    for (const format of options.formats) {
      const filename = exportFileName(basename, size, format);
      const outputPath = path.join(options.out, filename);
      let pipeline = sharp(options.input).resize(size, size, { fit: "contain", withoutEnlargement: false });

      if (format === "webp") {
        pipeline = pipeline.webp({ quality: options.webpQuality });
      } else if (format === "jpeg") {
        pipeline = pipeline.jpeg({ quality: options.webpQuality });
      } else {
        pipeline = pipeline.png();
      }

      await pipeline.toFile(outputPath);
      const metadata = await sharp(outputPath).metadata();
      const file = await stat(outputPath);

      exports.push({
        path: outputPath,
        format,
        width: metadata.width ?? size,
        height: metadata.height ?? size,
        quality: format === "webp" || format === "jpeg" ? options.webpQuality : undefined,
        bytes: file.size
      });
    }
  }

  const manifest = { exports };
  await writeFile(path.join(options.out, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}
