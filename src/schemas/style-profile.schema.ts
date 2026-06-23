import { z } from "zod";
import { AssetTypeSchema, BackgroundModeSchema } from "./asset-brief.schema.js";

export const StyleProfileSchema = z.object({
  style: z.object({
    name: z
      .string()
      .min(1)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase hyphen-case names."),
    display_name: z.string().min(1),
    description: z.string().default(""),
    visual_language: z
      .object({
        keywords: z.array(z.string()).default([]),
        materials: z.array(z.string()).default([]),
        lighting: z.array(z.string()).default([]),
        composition: z.array(z.string()).default([])
      })
      .default({ keywords: [], materials: [], lighting: [], composition: [] }),
    defaults: z
      .object({
        background_mode: BackgroundModeSchema.default("white"),
        complexity_level: z.enum(["minimal", "balanced", "rich"]).default("minimal"),
        main_elements: z.number().int().min(1).default(1),
        accent_elements: z.number().int().min(0).default(2),
        allow_ui_mockups: z.boolean().default(false),
        allow_text: z.boolean().default(false)
      })
      .default({
        background_mode: "white",
        complexity_level: "minimal",
        main_elements: 1,
        accent_elements: 2,
        allow_ui_mockups: false,
        allow_text: false
      }),
    forbidden: z.array(z.string()).default([]),
    best_for: z.array(AssetTypeSchema).default([])
  })
});

export type StyleProfile = z.infer<typeof StyleProfileSchema>;
