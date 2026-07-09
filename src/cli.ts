#!/usr/bin/env node
import { Command } from "commander";
import { registerAnimateCommand } from "./commands/animate.js";
import { registerBriefCommand } from "./commands/brief.js";
import { registerDoctorCommand } from "./commands/doctor.js";
import { registerExportCommand } from "./commands/export.js";
import { registerGenerateCommand } from "./commands/generate.js";
import { registerInitBrandCommand } from "./commands/init-brand.js";
import { registerPackageCommand } from "./commands/package.js";
import { registerValidateCommand } from "./commands/validate.js";
import { loadDotEnv } from "./utils/env.js";

loadDotEnv();

const program = new Command();

program.name("abento").description("Generate brand-consistent product image asset packages.").version("0.1.0");

registerInitBrandCommand(program);
registerDoctorCommand(program);
registerBriefCommand(program);
registerGenerateCommand(program);
registerExportCommand(program);
registerPackageCommand(program);
registerAnimateCommand(program);
registerValidateCommand(program);

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exitCode = 1;
});
