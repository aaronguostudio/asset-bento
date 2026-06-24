import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

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
