import OpenAI from "openai";
import type { AssetBackgroundMode, GenerateImageInput, GenerateImageResult, ImageProvider } from "./image-provider.js";

type OpenAIImageClient = {
  images: {
    generate(input: Record<string, unknown>): Promise<{
      data?: Array<{
        b64_json?: string;
        revised_prompt?: string;
      }>;
    }>;
  };
};

type OpenAIImageProviderOptions = {
  apiKey?: string;
  client?: OpenAIImageClient;
};

export function mapBackgroundForOpenAI(mode: AssetBackgroundMode | "auto" | undefined) {
  if (mode === "native-transparent") {
    return "transparent";
  }

  if (mode === "auto") {
    return "auto";
  }

  return "opaque";
}

function mimeTypeFor(format: string | undefined) {
  if (format === "webp") return "image/webp";
  if (format === "jpeg") return "image/jpeg";
  return "image/png";
}

function supportsOutputCompression(format: string | undefined) {
  return format === "webp" || format === "jpeg";
}

export class OpenAIImageProvider implements ImageProvider {
  private readonly client: OpenAIImageClient;

  constructor(options: OpenAIImageProviderOptions = {}) {
    this.client =
      options.client ?? (new OpenAI({ apiKey: options.apiKey ?? process.env.OPENAI_API_KEY }) as unknown as OpenAIImageClient);
  }

  async generate(input: GenerateImageInput): Promise<GenerateImageResult[]> {
    if (input.referenceImages?.length) {
      throw new Error("Reference-image edits are not implemented in Asset Bento MVP. Use prompt-only generation.");
    }

    const outputFormat = input.outputFormat ?? "png";
    const request: Record<string, unknown> = {
      model: input.model ?? process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-2",
      prompt: input.prompt,
      n: input.variations ?? 1,
      size: input.size ?? "1024x1024",
      quality: input.quality ?? "auto",
      output_format: outputFormat,
      background: mapBackgroundForOpenAI(input.background)
    };

    if (supportsOutputCompression(outputFormat) && input.outputCompression !== undefined) {
      request.output_compression = input.outputCompression;
    }

    const response = await this.client.images.generate(request);

    return (response.data ?? []).map((image) => {
      if (!image.b64_json) {
        throw new Error("OpenAI image generation returned no base64 image data.");
      }

      return {
        buffer: Buffer.from(image.b64_json, "base64"),
        revisedPrompt: image.revised_prompt,
        mimeType: mimeTypeFor(input.outputFormat)
      };
    });
  }
}
