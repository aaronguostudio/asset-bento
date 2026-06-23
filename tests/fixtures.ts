import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { tmpdir } from "node:os";
import type { AssetBrief } from "../src/schemas/asset-brief.schema.js";
import type { BrandProfile } from "../src/schemas/brand-profile.schema.js";

export async function makeTempDir(name: string) {
  const dir = path.join(tmpdir(), `asset-bento-${name}-${Date.now()}`);
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function makeFixturePng(filePath: string) {
  const buffer = await sharp({
    create: {
      width: 64,
      height: 64,
      channels: 4,
      background: { r: 16, g: 217, b: 154, alpha: 1 }
    }
  })
    .png()
    .toBuffer();
  await writeFile(filePath, buffer);
}

export const sampleBrand: BrandProfile = {
  brand: {
    name: "TinyNest",
    description: "Family-friendly scheduling software for small childcare teams.",
    colors: {
      primary: "#10D99A",
      navy: "#08232B",
      white: "#FFFFFF"
    },
    visual_language: {
      keywords: ["clean SaaS", "child-friendly", "soft 3D"],
      materials: ["frosted glass", "soft ceramic"],
      lighting: ["bright white background", "soft shadows"]
    },
    constraints: {
      no_text_in_images: true,
      no_logo_recreation: true,
      no_busy_dashboards_by_default: true,
      prefer_white_background: true
    },
    references: []
  }
};

export const sampleBrief: AssetBrief = {
  brand_profile: "./brand-profile.yaml",
  asset: {
    name: "tn-loading-duo",
    type: "loading",
    intent: "A calm loading illustration inspired by two companion figures waiting together.",
    usage: ["page loading", "modal loading"],
    background: {
      mode: "white"
    },
    dimensions: {
      aspect_ratio: "1:1",
      target_sizes: [256, 512]
    },
    complexity: {
      level: "minimal",
      main_elements: 1,
      accent_elements: 2,
      allow_ui_mockups: false,
      allow_text: false
    },
    direction: {
      main_subject: "Two abstract friendly figures on a soft pedestal.",
      supporting_accents: ["two subtle orbit arcs", "two small loading dots"],
      mood: ["calm", "friendly", "premium"]
    },
    export: {
      formats: ["png", "webp"],
      webp_quality: 82
    }
  }
};
