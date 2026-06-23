import type { BackgroundModeSchema, ExportFormat } from "../schemas/asset-brief.schema.js";
import type { z } from "zod";

export type AssetBackgroundMode = z.infer<typeof BackgroundModeSchema>;

export type GenerateImageInput = {
  prompt: string;
  model?: string;
  size?: string;
  quality?: "low" | "medium" | "high" | "auto";
  outputFormat?: ExportFormat;
  outputCompression?: number;
  background?: AssetBackgroundMode | "auto";
  referenceImages?: string[];
  variations?: number;
};

export type GenerateImageResult = {
  buffer: Buffer;
  mimeType: string;
  revisedPrompt?: string;
};

export interface ImageProvider {
  generate(input: GenerateImageInput): Promise<GenerateImageResult[]>;
}
