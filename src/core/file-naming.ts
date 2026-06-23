import type { ExportFormat } from "../schemas/asset-brief.schema.js";

export function sanitizeAssetName(name: string) {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "asset";
}

export function pascalCaseAssetName(name: string) {
  return sanitizeAssetName(name)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export function exportFileName(assetName: string, size: number, format: ExportFormat) {
  return `${sanitizeAssetName(assetName)}@${size}.${format}`;
}
