import { basename } from "node:path";
import { readFile } from "node:fs/promises";

export type InputKind = "spdx" | "cyclonedx" | "composer" | "npm" | "pnpm" | "yarn" | "unknown";

const SPDX_JSON_HINT = /spdx/i;

export async function detectInputKind(inputPath: string): Promise<InputKind> {
  const base = basename(inputPath);
  if (base === "composer.lock") {
    return "composer";
  }
  if (base === "package-lock.json" || base === "npm-shrinkwrap.json") {
    return "npm";
  }
  if (base === "pnpm-lock.yaml" || base === "pnpm-lock.yml") {
    return "pnpm";
  }
  if (base === "yarn.lock") {
    return "yarn";
  }
  if (/\.cdx\.json$/i.test(base) || /\.cdx\.xml$/i.test(base)) {
    return "cyclonedx";
  }
  if (/\.spdx\.(yaml|yml)$/i.test(base) || /\.rdf(\.xml)?$/i.test(base) || base === ".spdx") {
    return "spdx";
  }

  const headBuf = await readFile(inputPath);
  const head = headBuf.subarray(0, 8192);
  const trimmed = head.toString("utf8").trimStart();
  const lowered = head.toString("latin1").toLowerCase();

  if (trimmed.startsWith("<")) {
    if (lowered.includes("<bom") || lowered.includes("cyclonedx.org")) {
      return "cyclonedx";
    }
    if (lowered.includes("spdx") || lowered.includes("<rdf:rdf")) {
      return "spdx";
    }
    return "unknown";
  }

  if (trimmed.startsWith("SPDXVersion:") || head.includes("\nSPDXVersion:")) {
    return "spdx";
  }
  if (lowered.includes("spdxversion:")) {
    return "spdx";
  }

  if (trimmed.startsWith("__metadata:")) {
    return "yarn";
  }
  if (trimmed.includes("yarn lockfile v1") || /^[\w@/].+@.+:$/m.test(trimmed)) {
    return "yarn";
  }
  if (/^lockfileVersion:/m.test(trimmed) && /(^|\n)packages:/m.test(trimmed)) {
    return "pnpm";
  }

  if (!trimmed.startsWith("{")) {
    return "unknown";
  }

  const fullText = headBuf.toString("utf8");
  try {
    const parsed = JSON.parse(fullText) as Record<string, unknown>;
    if (typeof parsed.bomFormat === "string" && parsed.bomFormat.toLowerCase() === "cyclonedx") {
      return "cyclonedx";
    }
    if (typeof parsed.spdxVersion === "string" || SPDX_JSON_HINT.test(base)) {
      return "spdx";
    }
    if (Array.isArray(parsed.components) && parsed.metadata !== undefined) {
      return "cyclonedx";
    }
    if (Array.isArray(parsed.packages) && typeof parsed.packages[0] === "object") {
      const first = parsed.packages[0] as { name?: string };
      if (first?.name?.includes("/")) {
        return "composer";
      }
    }
    if (parsed.lockfileVersion !== undefined && parsed.packages !== undefined) {
      return "npm";
    }
  } catch {
    return "unknown";
  }

  return "unknown";
}

export class UnknownInputError extends Error {
  readonly exitCode = 2;

  constructor(path: string) {
    super(`could not detect input format: ${path}`);
    this.name = "UnknownInputError";
  }
}