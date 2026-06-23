import type { Command } from "commander";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildPrompt } from "../core/prompt-builder.js";
import { OpenAIImageProvider } from "../core/openai-image-provider.js";
import { createInitialManifest } from "../core/metadata.js";
import { AssetBriefSchema } from "../schemas/asset-brief.schema.js";
import { BrandProfileSchema } from "../schemas/brand-profile.schema.js";
import { loadDataFile, resolveRelativeTo, writeJsonFile } from "../utils/fs.js";

async function exists(target: string) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

export function registerGenerateCommand(program: Command) {
  program
    .command("generate")
    .description("Generate image variations from a brand profile and asset brief.")
    .requiredOption("--brief <path>", "Asset brief YAML path")
    .option("--brand <path>", "Brand profile YAML path override")
    .option("--variations <number>", "Number of variations", "1")
    .option("--out <path>", "Output directory", "./outputs")
    .option("--model <model>", "OpenAI image model")
    .option("--force", "Overwrite existing variation folders", false)
    .action(async (options: { brief: string; brand?: string; variations: string; out: string; model?: string; force: boolean }) => {
      const brief = await loadDataFile(options.brief, AssetBriefSchema);
      const brandPath = options.brand ?? (brief.brand_profile ? resolveRelativeTo(options.brief, brief.brand_profile) : undefined);

      if (!brandPath) {
        throw new Error("No brand profile found. Pass --brand or include brand_profile in the brief.");
      }

      const brandProfile = await loadDataFile(brandPath, BrandProfileSchema);
      const prompt = buildPrompt(brandProfile, brief);
      const model = options.model ?? process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-2";
      const provider = new OpenAIImageProvider();
      const variations = Number.parseInt(options.variations, 10);
      const results = await provider.generate({
        prompt,
        model,
        variations,
        quality: "auto",
        outputFormat: brief.asset.export.formats[0] ?? "png",
        outputCompression: brief.asset.export.webp_quality,
        background: brief.asset.background.mode
      });

      await mkdir(options.out, { recursive: true });
      const briefText = await readFile(options.brief, "utf8");

      for (const [index, result] of results.entries()) {
        const variation = String(index + 1).padStart(3, "0");
        const dir = path.join(options.out, variation);

        if ((await exists(dir)) && !options.force) {
          throw new Error(`${dir} already exists. Pass --force to overwrite.`);
        }

        await mkdir(dir, { recursive: true });
        const ext = result.mimeType === "image/webp" ? "webp" : result.mimeType === "image/jpeg" ? "jpg" : "png";
        await writeFile(path.join(dir, `original.${ext}`), result.buffer);
        await writeFile(path.join(dir, "prompt.md"), `${prompt}\n`, "utf8");
        await writeFile(path.join(dir, "brief.yaml"), briefText, "utf8");
        await writeJsonFile(
          path.join(dir, "manifest.json"),
          createInitialManifest({
            brandProfile,
            brief,
            provider: "openai",
            model,
            promptFile: "./prompt.md",
            briefFile: "./brief.yaml"
          })
        );
      }

      console.log(`Generated ${results.length} variation${results.length === 1 ? "" : "s"} in ${options.out}`);
    });
}
