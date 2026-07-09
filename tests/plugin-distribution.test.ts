import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const execFileAsync = promisify(execFile);

async function readJson<T>(relativePath: string): Promise<T> {
  const file = await readFile(path.join(root, relativePath), "utf8");
  return JSON.parse(file) as T;
}

async function expectPathExists(relativePath: string): Promise<void> {
  await expect(access(path.join(root, relativePath))).resolves.toBeUndefined();
}

type PackageJson = {
  name: string;
  version: string;
  description: string;
  keywords: string[];
  homepage: string;
  repository: {
    url: string;
  };
  files: string[];
  license: string;
};

type CodexPluginManifest = {
  name: string;
  version: string;
  description: string;
  author: {
    name: string;
    url: string;
  };
  homepage: string;
  repository: string;
  license: string;
  keywords: string[];
  skills: string;
  hooks?: string;
  interface: {
    displayName: string;
    shortDescription: string;
    longDescription: string;
    developerName: string;
    category: string;
    capabilities: string[];
    defaultPrompt: string[];
    websiteURL: string;
    privacyPolicyURL: string;
    termsOfServiceURL: string;
    brandColor: string;
    composerIcon: string;
    logo: string;
    screenshots: string[];
  };
};

type CodexMarketplace = {
  name: string;
  interface: {
    displayName: string;
  };
  plugins: Array<{
    name: string;
    source: {
      source: string;
      path: string;
    };
    policy: {
      installation: string;
      authentication: string;
    };
    category: string;
  }>;
};

type ClaudePluginManifest = {
  name: string;
  description: string;
  version: string;
  author: {
    name: string;
    url: string;
  };
  homepage: string;
  repository: string;
  license: string;
  keywords: string[];
};

type NpmPackDryRun = Array<{
  files: Array<{
    path: string;
  }>;
}>;

describe("Codex plugin distribution", () => {
  it("defines a Codex plugin manifest that points at the canonical skill", async () => {
    const pkg = await readJson<PackageJson>("package.json");
    const manifest = await readJson<CodexPluginManifest>(".codex-plugin/plugin.json");

    expect(manifest.name).toBe(pkg.name);
    expect(manifest.version).toBe(pkg.version);
    expect(manifest.description).toBe(pkg.description);
    expect(manifest.license).toBe(pkg.license);
    expect(manifest.homepage).toBe(pkg.homepage);
    expect(manifest.repository).toBe("https://github.com/aaronguostudio/asset-bento");
    expect(manifest.keywords).toEqual(pkg.keywords);
    expect(manifest.skills).toBe("./skills/");
    expect(manifest.hooks).toBeUndefined();
    expect(manifest.interface.displayName).toBe("Asset Bento");
    expect(manifest.interface.category).toBe("Coding");
    expect(manifest.interface.capabilities).toEqual(expect.arrayContaining(["Interactive", "Read", "Write"]));
    expect(manifest.interface.defaultPrompt).toContain("Help me make a premium but friendly loading asset for TinyNest.");
    expect(manifest.interface.composerIcon).toMatch(/^\.\/assets\//);
    expect(manifest.interface.logo).toMatch(/^\.\/assets\//);

    await expectPathExists("skills/asset-bento/SKILL.md");
    await expectPathExists(manifest.interface.composerIcon);
    await expectPathExists(manifest.interface.logo);
    expect(pkg.files).toEqual(expect.arrayContaining([".codex-plugin"]));
    expect(pkg.files).toEqual(expect.arrayContaining(["assets"]));
  });

  it("exposes Asset Bento through a repo-scoped Codex marketplace", async () => {
    const marketplace = await readJson<CodexMarketplace>(".agents/plugins/marketplace.json");

    expect(marketplace.name).toBe("asset-bento-local");
    expect(marketplace.interface.displayName).toBe("Asset Bento Local");
    expect(marketplace.plugins).toHaveLength(1);
    expect(marketplace.plugins[0]).toEqual({
      name: "asset-bento",
      source: {
        source: "local",
        path: "./"
      },
      policy: {
        installation: "AVAILABLE",
        authentication: "ON_INSTALL"
      },
      category: "Coding"
    });
  });
});

describe("Claude Code plugin distribution", () => {
  it("defines a Claude Code plugin manifest for the canonical skill", async () => {
    const pkg = await readJson<PackageJson>("package.json");
    const manifest = await readJson<ClaudePluginManifest>(".claude-plugin/plugin.json");

    expect(manifest.name).toBe(pkg.name);
    expect(manifest.version).toBe(pkg.version);
    expect(manifest.description).toBe(pkg.description);
    expect(manifest.license).toBe(pkg.license);
    expect(manifest.homepage).toBe(pkg.homepage);
    expect(manifest.repository).toBe("https://github.com/aaronguostudio/asset-bento");
    expect(manifest.keywords).toEqual(pkg.keywords);
    expect(manifest.author.name).toBe("Aaron Guo Studio");

    await expectPathExists("skills/asset-bento/SKILL.md");
    expect(pkg.files).toEqual(expect.arrayContaining([".claude-plugin"]));
  });
});

describe("plugin installation documentation", () => {
  it("puts plugin installation before CLI development setup in the README", async () => {
    const readme = await readFile(path.join(root, "README.md"), "utf8");

    const codexInstall = readme.indexOf("## Install In Codex");
    const claudeInstall = readme.indexOf("## Install In Claude Code");
    const cliUsage = readme.indexOf("## Use The CLI");
    const development = readme.indexOf("## Development");

    expect(codexInstall).toBeGreaterThan(-1);
    expect(claudeInstall).toBeGreaterThan(codexInstall);
    expect(cliUsage).toBeGreaterThan(claudeInstall);
    expect(development).toBeGreaterThan(cliUsage);
    expect(readme).toContain("codex plugin marketplace add");
    expect(readme).toContain("claude --plugin-dir");
    expect(readme).toContain("Help me make a premium but friendly loading asset for TinyNest.");
  });

  it("documents the plugin layout and local validation commands", async () => {
    const docs = await readFile(path.join(root, "docs/plugins.md"), "utf8");

    expect(docs).toContain(".codex-plugin/plugin.json");
    expect(docs).toContain(".claude-plugin/plugin.json");
    expect(docs).toContain(".agents/plugins/marketplace.json");
    expect(docs).toContain("claude --plugin-dir .");
    expect(docs).toContain("npm test -- tests/plugin-distribution.test.ts");
    expect(docs).toContain("npm run pack:check");
  });
});

describe("npm package contents", () => {
  it("ships the runtime resources referenced by the installed skill", async () => {
    const { stdout } = await execFileAsync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
      cwd: root,
      env: {
        ...process.env,
        npm_config_cache: path.join(tmpdir(), "asset-bento-npm-cache")
      }
    });
    const [pack] = JSON.parse(stdout) as NpmPackDryRun;
    const files = pack.files.map((file) => file.path);

    expect(files).toEqual(
      expect.arrayContaining([
        "presets/styles/premium-minimal.yaml",
        "presets/styles/soft-glass.yaml",
        "presets/styles/friendly-clay.yaml",
        "presets/styles/clean-saas-3d.yaml",
        "presets/styles/flat-product-icon.yaml",
        "presets/styles/playful-mascot-lite.yaml",
        "docs/asset-brief.md",
        "docs/style-profiles.md",
        "docs/guided-sessions.md",
        "docs/transparency.md",
        "docs/animation.md",
        "docs/plugins.md",
        "examples/tinynest-style/brand-profile.yaml",
        "examples/tinynest-style/briefs/loading-duo.yaml",
        "RELEASE_NOTES.md",
        "CONTRIBUTING.md",
        "SECURITY.md"
      ])
    );
  });
});
