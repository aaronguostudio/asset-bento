import { z } from "zod";
import { ExportFormatSchema } from "./asset-brief.schema.js";

export const ExportOptionsSchema = z.object({
  input: z.string().min(1),
  out: z.string().min(1),
  basename: z.string().min(1),
  sizes: z.array(z.number().int().positive()).min(1),
  formats: z.array(ExportFormatSchema).min(1),
  webpQuality: z.number().int().min(1).max(100).default(82)
});

export type ExportOptions = z.infer<typeof ExportOptionsSchema>;
