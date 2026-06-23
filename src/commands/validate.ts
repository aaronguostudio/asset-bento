import type { Command } from "commander";
import { AssetBriefSchema } from "../schemas/asset-brief.schema.js";
import { BrandProfileSchema } from "../schemas/brand-profile.schema.js";
import { ManifestSchema } from "../schemas/manifest.schema.js";
import { loadDataFile } from "../utils/fs.js";
import type { ZodType } from "zod";

type ValidationTarget = {
  path: string;
  schema: ZodType<unknown>;
  label: string;
};

export function registerValidateCommand(program: Command) {
  program
    .command("validate")
    .description("Validate a brand profile, asset brief, or manifest.")
    .option("--brand <path>", "Brand profile YAML path")
    .option("--brief <path>", "Asset brief YAML path")
    .option("--manifest <path>", "Manifest JSON path")
    .action(async (options: { brand?: string; brief?: string; manifest?: string }) => {
      const targets: ValidationTarget[] = [];

      if (options.brand) {
        targets.push({ path: options.brand, schema: BrandProfileSchema, label: "brand" });
      }

      if (options.brief) {
        targets.push({ path: options.brief, schema: AssetBriefSchema, label: "brief" });
      }

      if (options.manifest) {
        targets.push({ path: options.manifest, schema: ManifestSchema, label: "manifest" });
      }

      if (!targets.length) {
        throw new Error("Pass --brand, --brief, or --manifest.");
      }

      for (const target of targets) {
        await loadDataFile(target.path, target.schema);
        console.log(`Valid ${target.label}: ${target.path}`);
      }
    });
}
