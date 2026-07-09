import type { Command } from "commander";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildPrompt } from "../core/prompt-builder.js";
import { OpenAIImageProvider } from "../core/openai-image-provider.js";
import { createInitialManifest } from "../core/metadata.js";
import { AssetBriefSchema } from "../schemas/asset-brief.schema.js";
import { BrandProfileSchema } from "../schemas/brand-profile.schema.js";
import { StyleProfileSchema } from "../schemas/style-profile.schema.js";
import { loadDataFile, resolveRelativeTo, writeJsonFile } from "../utils/fs.js";

async function exists(target: string) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

export type GeneratePlanOptions = {
  brief: string;
  brand?: string;
  style?: string;
  variations?: string;
  out?: string;
  model?: string;
};

export async function createGeneratePlan(options: GeneratePlanOptions) {
  const brief = await loadDataFile(options.brief, AssetBriefSchema);
  const brandPath =
    options.brand ??
    (brief.brand_profile
      ? resolveRelativeTo(options.brief, brief.brand_profile)
      : undefined);

  if (!brandPath) {
    throw new Error(
      "No brand profile found. Pass --brand or include brand_profile in the brief.",
    );
  }

  const stylePath =
    options.style ??
    (brief.style_profile
      ? resolveRelativeTo(options.brief, brief.style_profile)
      : undefined);
  const brandProfile = await loadDataFile(brandPath, BrandProfileSchema);
  const styleProfile = stylePath
    ? await loadDataFile(stylePath, StyleProfileSchema)
    : undefined;
  const prompt = buildPrompt(brandProfile, brief, styleProfile);
  const model =
    options.model ?? process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-2";
  const variations = options.variations
    ? Number.parseInt(options.variations, 10)
    : 1;

  if (!Number.isInteger(variations) || variations < 1) {
    throw new Error("Variations must be a positive integer.");
  }

  return {
    briefPath: options.brief,
    brandPath,
    stylePath,
    brief,
    brandProfile,
    styleProfile,
    prompt,
    model,
    variations,
    out: options.out ?? "./outputs",
    outputFormat: brief.asset.export.formats[0] ?? "png",
    outputCompression: brief.asset.export.webp_quality,
    background: brief.asset.background.mode,
  };
}

export function formatGenerateDryRun(
  plan: Awaited<ReturnType<typeof createGeneratePlan>>,
) {
  return [
    "Asset Bento generate dry run",
    `Brief: ${plan.briefPath}`,
    `Brand: ${plan.brandPath}`,
    `Style: ${plan.stylePath ?? "(none)"}`,
    `Model: ${plan.model}`,
    `Variations: ${plan.variations}`,
    `Output: ${plan.out}`,
    `Output format: ${plan.outputFormat}`,
    `Background: ${plan.background}`,
    "",
    "Prompt:",
    plan.prompt,
  ].join("\n");
}

export function registerGenerateCommand(program: Command) {
  program
    .command("generate")
    .description(
      "Generate image variations from a brand profile and asset brief.",
    )
    .requiredOption("--brief <path>", "Asset brief YAML path")
    .option("--brand <path>", "Brand profile YAML path override")
    .option("--style <path>", "Style profile YAML path override")
    .option("--variations <number>", "Number of variations", "1")
    .option("--out <path>", "Output directory", "./outputs")
    .option("--model <model>", "OpenAI image model")
    .option("--force", "Overwrite existing variation folders", false)
    .option(
      "--dry-run",
      "Print the resolved generation prompt without calling the image provider",
      false,
    )
    .action(
      async (options: {
        brief: string;
        brand?: string;
        style?: string;
        variations: string;
        out: string;
        model?: string;
        force: boolean;
        dryRun: boolean;
      }) => {
        const plan = await createGeneratePlan(options);

        if (options.dryRun) {
          console.log(formatGenerateDryRun(plan));
          return;
        }

        const provider = new OpenAIImageProvider();
        const results = await provider.generate({
          prompt: plan.prompt,
          model: plan.model,
          variations: plan.variations,
          quality: "auto",
          outputFormat: plan.outputFormat,
          outputCompression: plan.outputCompression,
          background: plan.background,
        });

        await mkdir(plan.out, { recursive: true });
        const briefText = await readFile(options.brief, "utf8");

        for (const [index, result] of results.entries()) {
          const variation = String(index + 1).padStart(3, "0");
          const dir = path.join(plan.out, variation);

          if ((await exists(dir)) && !options.force) {
            throw new Error(
              `${dir} already exists. Pass --force to overwrite.`,
            );
          }

          await mkdir(dir, { recursive: true });
          const ext =
            result.mimeType === "image/webp"
              ? "webp"
              : result.mimeType === "image/jpeg"
                ? "jpg"
                : "png";
          await writeFile(path.join(dir, `original.${ext}`), result.buffer);
          await writeFile(
            path.join(dir, "prompt.md"),
            `${plan.prompt}\n`,
            "utf8",
          );
          await writeFile(path.join(dir, "brief.yaml"), briefText, "utf8");
          await writeJsonFile(
            path.join(dir, "manifest.json"),
            createInitialManifest({
              brandProfile: plan.brandProfile,
              brief: plan.brief,
              provider: "openai",
              model: plan.model,
              promptFile: "./prompt.md",
              briefFile: "./brief.yaml",
            }),
          );
        }

        console.log(
          `Generated ${results.length} variation${results.length === 1 ? "" : "s"} in ${plan.out}`,
        );
      },
    );
}
