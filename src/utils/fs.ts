import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import type { ZodType } from "zod";

export async function ensureParentDir(filePath: string) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

export async function writeYamlFile(filePath: string, value: unknown) {
  await ensureParentDir(filePath);
  await writeFile(filePath, YAML.stringify(value), "utf8");
}

export async function writeJsonFile(filePath: string, value: unknown) {
  await ensureParentDir(filePath);
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function loadDataFile<T>(filePath: string, schema?: ZodType<T>): Promise<T> {
  const text = await readFile(filePath, "utf8");
  const parsed = filePath.endsWith(".json") ? JSON.parse(text) : YAML.parse(text);

  if (!schema) {
    return parsed as T;
  }

  return schema.parse(parsed);
}

export function resolveRelativeTo(fromFile: string, maybeRelative: string) {
  if (path.isAbsolute(maybeRelative)) {
    return maybeRelative;
  }

  return path.resolve(path.dirname(fromFile), maybeRelative);
}
