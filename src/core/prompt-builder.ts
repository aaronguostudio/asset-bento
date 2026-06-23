import type { AssetBrief } from "../schemas/asset-brief.schema.js";
import type { BrandProfile } from "../schemas/brand-profile.schema.js";
import type { StyleProfile } from "../schemas/style-profile.schema.js";

function sentenceList(values: string[]) {
  return values.filter(Boolean).join(", ");
}

function assetTypeLabel(type: string) {
  return type === "empty-state" ? "empty state" : type.replace(/-/g, " ");
}

export function buildPrompt(brandProfile: BrandProfile, brief: AssetBrief, styleProfile?: StyleProfile) {
  const brand = brandProfile.brand;
  const asset = brief.asset;
  const visual = brand.visual_language;
  const complexity = asset.complexity;
  const colorValues = Object.values(brand.colors);
  const usage = sentenceList(asset.usage);
  const accents = asset.direction.supporting_accents.slice(0, complexity.accent_elements);
  const prompt: string[] = [];

  prompt.push(
    `Create a standalone product image asset for ${brand.name}, ${brand.description || "a software product"}.`
  );
  prompt.push(`The asset represents a ${assetTypeLabel(asset.type)} state.`);

  if (usage) {
    prompt.push(`It will be used for ${usage}.`);
  }

  prompt.push(`Use a ${asset.background.mode === "white" ? "clean white" : asset.background.mode} background.`);

  if (visual.keywords?.length) {
    prompt.push(`Use this visual language: ${sentenceList(visual.keywords)}.`);
  }

  if (visual.materials?.length) {
    prompt.push(`Materials may include ${sentenceList(visual.materials)}.`);
  }

  if (visual.lighting?.length) {
    prompt.push(`Lighting: ${sentenceList(visual.lighting)}.`);
  }

  if (colorValues.length) {
    prompt.push(`Prefer this palette: ${sentenceList(colorValues)}.`);
  }

  if (styleProfile) {
    const style = styleProfile.style;
    prompt.push(`Style profile: ${style.display_name}. ${style.description}`);

    if (style.visual_language.keywords.length) {
      prompt.push(`Style keywords: ${sentenceList(style.visual_language.keywords)}.`);
    }

    if (style.visual_language.materials.length) {
      prompt.push(`Style materials: ${sentenceList(style.visual_language.materials)}.`);
    }

    if (style.visual_language.lighting.length) {
      prompt.push(`Style lighting: ${sentenceList(style.visual_language.lighting)}.`);
    }

    if (style.visual_language.composition.length) {
      prompt.push(`Composition: ${sentenceList(style.visual_language.composition)}.`);
    }
  }

  prompt.push(
    `Use one main subject only: ${asset.direction.main_subject}. Keep the composition ${complexity.level}, with ${complexity.main_elements} main element${complexity.main_elements === 1 ? "" : "s"}.`
  );

  if (accents.length) {
    prompt.push(`Add only these ${accents.length} small accent element${accents.length === 1 ? "" : "s"}: ${sentenceList(accents)}.`);
  }

  if (asset.direction.mood.length) {
    prompt.push(`Mood: ${sentenceList(asset.direction.mood)}.`);
  }

  prompt.push(`Aspect ratio: ${asset.dimensions.aspect_ratio}. Centered composition, suitable for a real SaaS web interface.`);

  if (complexity.allow_text) {
    prompt.push("Readable text is allowed only if it directly serves the asset brief.");
  } else {
    prompt.push("Do not include text, lettering, captions, labels, or words inside the image.");
  }

  prompt.push("Do not include logos or recreate brand marks.");

  if (complexity.allow_ui_mockups) {
    prompt.push("Simple UI mockups are allowed when they support the main subject.");
  } else {
    prompt.push("Do not include dashboards, UI labels, random panels, fake charts, or busy app screens.");
  }

  if (styleProfile?.style.forbidden.length) {
    prompt.push(`Avoid these style-specific forbidden elements: ${sentenceList(styleProfile.style.forbidden)}.`);
  }

  prompt.push("Avoid clutter, extra icons, tiny decorative objects, and unrelated scene building.");

  return prompt.join(" ");
}
