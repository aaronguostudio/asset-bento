import type { AssetBrief } from "../schemas/asset-brief.schema.js";
import type { BrandProfile } from "../schemas/brand-profile.schema.js";
import type { AssetManifest } from "../schemas/manifest.schema.js";
import { sha256Object } from "../utils/hash.js";

type CreateInitialManifestInput = {
  brandProfile: BrandProfile;
  brief: AssetBrief;
  provider: string;
  model: string;
  promptFile: string;
  briefFile: string;
};

export function createInitialManifest(input: CreateInitialManifestInput): AssetManifest {
  const { brandProfile, brief } = input;
  const asset = brief.asset;

  return {
    name: asset.name,
    type: asset.type,
    createdAt: new Date().toISOString(),
    brand: {
      name: brandProfile.brand.name,
      profileHash: sha256Object(brandProfile)
    },
    source: {
      provider: input.provider,
      model: input.model,
      promptFile: input.promptFile,
      briefFile: input.briefFile
    },
    background: {
      mode: asset.background.mode
    },
    complexity: {
      level: asset.complexity.level,
      mainElements: asset.complexity.main_elements,
      accentElements: asset.complexity.accent_elements
    },
    usage: asset.usage,
    alt: buildAltText(brief),
    exports: []
  };
}

export function buildAltText(brief: AssetBrief) {
  const subject = brief.asset.direction.main_subject.replace(/\.$/, "");
  const accents = brief.asset.direction.supporting_accents.slice(0, brief.asset.complexity.accent_elements);

  if (!accents.length) {
    return subject;
  }

  return `${subject} with ${accents.join(" and ")}.`;
}
