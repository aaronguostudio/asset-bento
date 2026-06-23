import { z } from "zod";

export const AssetTypeSchema = z.enum([
  "empty-state",
  "loading",
  "success",
  "error",
  "attention",
  "onboarding",
  "feature",
  "team-icon",
  "avatar-placeholder",
  "billing",
  "communication",
  "learning",
  "custom"
]);

export const BackgroundModeSchema = z.enum(["white", "native-transparent", "experimental-white-to-alpha"]);
export const ExportFormatSchema = z.enum(["png", "webp", "jpeg"]);

export const AssetBriefSchema = z.object({
  brand_profile: z.string().optional(),
  asset: z.object({
    name: z.string().min(1),
    type: AssetTypeSchema,
    intent: z.string().default(""),
    usage: z.array(z.string()).default([]),
    background: z
      .object({
        mode: BackgroundModeSchema.default("white")
      })
      .default({ mode: "white" }),
    dimensions: z
      .object({
        aspect_ratio: z.string().default("1:1"),
        target_sizes: z.array(z.number().int().positive()).default([256, 512, 1024])
      })
      .default({ aspect_ratio: "1:1", target_sizes: [256, 512, 1024] }),
    complexity: z
      .object({
        level: z.enum(["minimal", "balanced", "rich"]).default("minimal"),
        main_elements: z.number().int().min(1).default(1),
        accent_elements: z.number().int().min(0).default(2),
        allow_ui_mockups: z.boolean().default(false),
        allow_text: z.boolean().default(false)
      })
      .default({
        level: "minimal",
        main_elements: 1,
        accent_elements: 2,
        allow_ui_mockups: false,
        allow_text: false
      }),
    direction: z
      .object({
        main_subject: z.string().default("A simple abstract product-ready subject."),
        supporting_accents: z.array(z.string()).default([]),
        mood: z.array(z.string()).default(["clean", "friendly", "product-ready"])
      })
      .default({
        main_subject: "A simple abstract product-ready subject.",
        supporting_accents: [],
        mood: ["clean", "friendly", "product-ready"]
      }),
    export: z
      .object({
        formats: z.array(ExportFormatSchema).default(["png", "webp"]),
        webp_quality: z.number().int().min(1).max(100).default(82)
      })
      .default({ formats: ["png", "webp"], webp_quality: 82 })
  })
});

export type AssetBrief = z.infer<typeof AssetBriefSchema>;
export type ExportFormat = z.infer<typeof ExportFormatSchema>;
