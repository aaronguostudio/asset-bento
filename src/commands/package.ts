import type { Command } from "commander";
import { cp, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { ManifestSchema } from "../schemas/manifest.schema.js";

async function copyIfExists(from: string, to: string) {
  try {
    await stat(from);
    await cp(from, to, { recursive: true });
  } catch {
    // Optional package inputs are skipped.
  }
}

export function registerPackageCommand(program: Command) {
  program
    .command("package")
    .description("Create a self-contained production asset package.")
    .requiredOption("--asset <path>", "Generated asset variation folder")
    .requiredOption("--out <path>", "Output package directory")
    .action(async (options: { asset: string; out: string }) => {
      await mkdir(options.out, { recursive: true });

      await copyIfExists(path.join(options.asset, "original.png"), path.join(options.out, "original.png"));
      await copyIfExists(path.join(options.asset, "original.webp"), path.join(options.out, "original.webp"));
      await copyIfExists(path.join(options.asset, "original.jpg"), path.join(options.out, "original.jpg"));
      await copyIfExists(path.join(options.asset, "prompt.md"), path.join(options.out, "prompt.md"));
      await copyIfExists(path.join(options.asset, "manifest.json"), path.join(options.out, "manifest.json"));
      await copyIfExists(path.join(options.asset, "export"), path.join(options.out, "exports"));

      let alt = "Generated product image asset.";
      let usage = "- Use exported WebP files for web UI surfaces.\n- Keep prompt.md and manifest.json for provenance.\n";
      try {
        const manifest = ManifestSchema.parse(JSON.parse(await readFile(path.join(options.asset, "manifest.json"), "utf8")));
        alt = manifest.alt;
        usage = manifest.usage.map((item) => `- ${item}`).join("\n") || usage;
      } catch {
        // Keep generic notes if manifest is unavailable.
      }

      await writeFile(path.join(options.out, "alt-text.md"), `${alt}\n`, "utf8");
      await writeFile(path.join(options.out, "usage-notes.md"), `${usage}\n`, "utf8");
      console.log(`Packaged ${options.out}`);
    });
}
