import path from "node:path";
import dotenv from "dotenv";

export function loadDotEnv(envPath = path.resolve(process.cwd(), ".env")) {
  return dotenv.config({
    path: envPath,
    override: false,
    quiet: true
  });
}
