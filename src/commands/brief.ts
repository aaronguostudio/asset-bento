import type { Command } from "commander";
import path from "node:path";
import type { AssetBrief } from "../schemas/asset-brief.schema.js";
import { AssetBriefSchema, AssetTypeSchema } from "../schemas/asset-brief.schema.js";
import { writeYamlFile } from "../utils/fs.js";

type CreateAssetBriefInput = {
  brandPath: string;
  outPath?: string;
  name: string;
  type: string;
  complexity: "minimal" | "balanced" | "rich";
};

function complexityDefaults(level: "minimal" | "balanced" | "rich") {
  if (level === "rich") {
    return { main_elements: 2, accent_elements: 5 };
  }

  if (level === "balanced") {
    return { main_elements: 1, accent_elements: 3 };
  }

  return { main_elements: 1, accent_elements: 2 };
}

function brandProfileReference(brandPath: string, outPath?: string) {
  if (!outPath) {
    return brandPath;
  }

  const fromDir = path.dirname(path.resolve(outPath));
  const toPath = path.resolve(brandPath);
  return path.relative(fromDir, toPath).replaceAll(path.sep, "/");
}

export function createAssetBrief(input: CreateAssetBriefInput): AssetBrief {
  const elementDefaults = complexityDefaults(input.complexity);

  return AssetBriefSchema.parse({
    brand_profile: brandProfileReference(input.brandPath, input.outPath),
    asset: {
      name: input.name,
      type: AssetTypeSchema.parse(input.type),
      intent: "Describe the product purpose this asset should serve.",
      usage: [input.type],
      background: {
        mode: "white"
      },
      dimensions: {
        aspect_ratio: "1:1",
        target_sizes: [256, 512, 1024]
      },
      complexity: {
        level: input.complexity,
        ...elementDefaults,
        allow_ui_mockups: false,
        allow_text: false
      },
      direction: {
        main_subject: "A single clean, product-ready visual subject.",
        supporting_accents: ["one subtle orbit arc", "one small accent dot"],
        mood: ["calm", "friendly", "premium"]
      },
      export: {
        formats: ["png", "webp"],
        webp_quality: 82
      }
    }
  });
}

export function registerBriefCommand(program: Command) {
  program
    .command("brief")
    .description("Create a starter asset brief YAML file.")
    .requiredOption("--brand <path>", "Brand profile YAML path")
    .requiredOption("--type <type>", "Asset type")
    .requiredOption("--name <name>", "Asset name")
    .option("--complexity <level>", "minimal, balanced, or rich", "minimal")
    .requiredOption("--out <path>", "Output YAML path")
    .action(async (options: { brand: string; type: string; name: string; complexity: "minimal" | "balanced" | "rich"; out: string }) => {
      await writeYamlFile(
        options.out,
        createAssetBrief({
          brandPath: options.brand,
          outPath: options.out,
          name: options.name,
          type: options.type,
          complexity: options.complexity
        })
      );
      console.log(`Created ${options.out}`);
    });
}
