import { z } from "zod";
import { AssetTypeSchema, BackgroundModeSchema, ExportFormatSchema } from "./asset-brief.schema.js";

export const ManifestSchema = z.object({
  name: z.string(),
  type: AssetTypeSchema,
  createdAt: z.string(),
  brand: z.object({
    name: z.string(),
    profileHash: z.string()
  }),
  source: z.object({
    provider: z.string(),
    model: z.string(),
    promptFile: z.string(),
    briefFile: z.string()
  }),
  background: z.object({
    mode: BackgroundModeSchema
  }),
  complexity: z.object({
    level: z.enum(["minimal", "balanced", "rich"]),
    mainElements: z.number(),
    accentElements: z.number()
  }),
  usage: z.array(z.string()),
  alt: z.string(),
  exports: z
    .array(
      z.object({
        path: z.string(),
        format: ExportFormatSchema,
        width: z.number(),
        height: z.number(),
        quality: z.number().optional(),
        bytes: z.number()
      })
    )
    .default([])
});

export type AssetManifest = z.infer<typeof ManifestSchema>;
