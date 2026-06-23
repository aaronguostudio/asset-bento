import { z } from "zod";

const VisualLanguageSchema = z
  .object({
    keywords: z.array(z.string()).optional(),
    materials: z.array(z.string()).optional(),
    lighting: z.array(z.string()).optional()
  })
  .default({});

const BrandConstraintsSchema = z
  .object({
    no_text_in_images: z.boolean().optional(),
    no_logo_recreation: z.boolean().optional(),
    no_busy_dashboards_by_default: z.boolean().optional(),
    prefer_white_background: z.boolean().optional()
  })
  .catchall(z.unknown())
  .default({});

export const BrandProfileSchema = z.object({
  brand: z.object({
    name: z.string().min(1),
    description: z.string().default(""),
    colors: z.record(z.string(), z.string()).default({}),
    visual_language: VisualLanguageSchema,
    constraints: BrandConstraintsSchema,
    references: z.array(z.string()).default([])
  })
});

export type BrandProfile = z.infer<typeof BrandProfileSchema>;
