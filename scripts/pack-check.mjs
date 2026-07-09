import { execFileSync } from "node:child_process";
import os from "node:os";
import path from "node:path";

const env = {
  ...process.env,
  npm_config_cache: path.join(os.tmpdir(), "asset-bento-npm-cache"),
};

execFileSync("npm", ["run", "build"], {
  stdio: "inherit",
  env,
});

execFileSync("npm", ["pack", "--dry-run", "--ignore-scripts"], {
  stdio: "inherit",
  env,
});
