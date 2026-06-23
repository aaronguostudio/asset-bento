import { describe, expect, it } from "vitest";
import { mapBackgroundForOpenAI, OpenAIImageProvider } from "../src/core/openai-image-provider.js";

describe("OpenAIImageProvider", () => {
  it("maps Asset Bento background modes to OpenAI Image API background values", () => {
    expect(mapBackgroundForOpenAI("white")).toBe("opaque");
    expect(mapBackgroundForOpenAI("native-transparent")).toBe("transparent");
    expect(mapBackgroundForOpenAI("experimental-white-to-alpha")).toBe("opaque");
  });

  it("passes generation options to the injected OpenAI client", async () => {
    const calls: unknown[] = [];
    const provider = new OpenAIImageProvider({
      client: {
        images: {
          generate: async (input: unknown) => {
            calls.push(input);
            return {
              data: [{ b64_json: Buffer.from("image").toString("base64") }]
            };
          }
        }
      }
    });

    const result = await provider.generate({
      prompt: "Create a calm loading asset.",
      model: "gpt-image-2",
      size: "1024x1024",
      quality: "high",
      outputFormat: "webp",
      outputCompression: 82,
      background: "white",
      variations: 2
    });

    expect(calls).toEqual([
      {
        model: "gpt-image-2",
        prompt: "Create a calm loading asset.",
        n: 2,
        size: "1024x1024",
        quality: "high",
        output_format: "webp",
        output_compression: 82,
        background: "opaque"
      }
    ]);
    expect(result[0].buffer.toString()).toBe("image");
  });

  it("does not pass output compression for PNG requests", async () => {
    const calls: Record<string, unknown>[] = [];
    const provider = new OpenAIImageProvider({
      client: {
        images: {
          generate: async (input: Record<string, unknown>) => {
            calls.push(input);
            return {
              data: [{ b64_json: Buffer.from("image").toString("base64") }]
            };
          }
        }
      }
    });

    await provider.generate({
      prompt: "Create a calm loading asset.",
      model: "gpt-image-2",
      outputFormat: "png",
      outputCompression: 82,
      background: "white"
    });

    expect(calls[0]).toMatchObject({
      model: "gpt-image-2",
      prompt: "Create a calm loading asset.",
      output_format: "png",
      background: "opaque"
    });
    expect(calls[0]).not.toHaveProperty("output_compression");
  });
});
