import type { Command } from "commander";
import type { BrandProfile } from "../schemas/brand-profile.schema.js";
import { BrandProfileSchema } from "../schemas/brand-profile.schema.js";
import { writeYamlFile } from "../utils/fs.js";

type InitBrandOptions = {
  out: string;
};

export function createStarterBrandProfile(name: string): BrandProfile {
  return BrandProfileSchema.parse({
    brand: {
      name,
      description: "Describe the product, audience, and emotional tone this asset system should support.",
      colors: {
        primary: "#10D99A",
        navy: "#08232B",
        white: "#FFFFFF",
        softGray: "#EEF3F6",
        accent: "#F7C9B5"
      },
      visual_language: {
        keywords: ["clean SaaS", "product-ready", "soft 3D"],
        materials: ["frosted glass", "soft ceramic", "subtle glossy plastic"],
        lighting: ["bright white background", "soft shadows", "gentle reflections"]
      },
      constraints: {
        no_text_in_images: true,
        no_logo_recreation: true,
        no_busy_dashboards_by_default: true,
        prefer_white_background: true
      },
      references: []
    }
  });
}

export function registerInitBrandCommand(program: Command) {
  program
    .command("init-brand")
    .description("Create a starter brand profile YAML file.")
    .requiredOption("--name <name>", "Brand or product name")
    .requiredOption("--out <path>", "Output YAML path")
    .action(async (options: InitBrandOptions & { name: string }) => {
      await writeYamlFile(options.out, createStarterBrandProfile(options.name));
      console.log(`Created ${options.out}`);
    });
}
