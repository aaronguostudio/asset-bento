import type { Command } from "commander";
import { createOrbitAnimation } from "../core/animation.js";

export function registerAnimateCommand(program: Command) {
  program
    .command("animate")
    .description("Create a CSS/SVG loading animation wrapper around a static image.")
    .requiredOption("--input <path>", "Input image path")
    .option("--type <type>", "Animation type", "orbit")
    .requiredOption("--out <path>", "Output directory")
    .option("--name <name>", "Asset name", "loading-asset")
    .action(async (options: { input: string; type: string; out: string; name: string }) => {
      if (options.type !== "orbit") {
        throw new Error("Asset Bento MVP supports only --type orbit.");
      }

      await createOrbitAnimation({
        input: options.input,
        out: options.out,
        assetName: options.name
      });
      console.log(`Created ${options.out}`);
    });
}
