import { readFile } from "node:fs/promises";
import YAML from "yaml";

import type { PackageRecord } from "../../types/notice.js";
import type { LockfileParseResult } from "../lockfile-types.js";

function yarnDescriptorName(descriptor: string): string {
  const clean = descriptor.replace(/,$/, "").replace(/^"/, "").replace(/"$/, "");
  const first = clean.split(",")[0]!.trim();
  if (first.startsWith("@")) {
    const at = first.indexOf("@", 1);
    if (at > 0) {
      return first.slice(0, at);
    }
  }
  const at = first.lastIndexOf("@");
  if (at > 0) {
    return first.slice(0, at);
  }
  return first;
}

function parseYarnV1(text: string, options?: { dev?: boolean }): LockfileParseResult {
  const warnings: string[] = [];
  const includeDev = options?.dev ?? false;
  const packages: PackageRecord[] = [];

  const blocks = text.split(/\r?\n\r?\n/);
  for (const block of blocks) {
    const lines = block.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length === 0) {
      continue;
    }
    const header = lines[0]!.trim();
    if (header.startsWith("#")) {
      continue;
    }

    const name = yarnDescriptorName(header.replace(/:$/, ""));

    let version = "UNKNOWN";
    let licenseSpdx: string | null = null;
    for (const line of lines.slice(1)) {
      const trimmed = line.trim();
      if (trimmed.startsWith('version "')) {
        version = trimmed.slice('version "'.length, -1);
      } else if (trimmed.startsWith("version ")) {
        version = trimmed.slice("version ".length).replace(/"/g, "");
      } else if (trimmed.startsWith('license "')) {
        licenseSpdx = trimmed.slice('license "'.length, -1);
      }
    }

    if (!includeDev && block.includes("development true")) {
      continue;
    }

    if (!licenseSpdx) {
      warnings.push(`no license information for ${name} ${version}`);
    }

    packages.push({
      name,
      version,
      ecosystem: "npm",
      licenseSpdx,
      licenseText: null,
      copyright: null,
      homepage: null,
      repository: null,
      description: null,
    });
  }

  return { documentName: "yarn-project", packages, warnings };
}

function parseBerryPackageKey(key: string): { name: string; version: string } {
  const unquoted = key.replace(/^"/, "").replace(/"$/, "");
  const npmIndex = unquoted.indexOf("@npm:");
  if (npmIndex >= 0) {
    const rest = unquoted.slice(npmIndex + "@npm:".length);
    const at = rest.lastIndexOf("@");
    if (at > 0) {
      return { name: rest.slice(0, at), version: rest.slice(at + 1) };
    }
    return { name: unquoted.slice(0, npmIndex), version: rest || "UNKNOWN" };
  }
  const at = unquoted.lastIndexOf("@");
  if (at > 0) {
    return { name: unquoted.slice(0, at), version: unquoted.slice(at + 1) };
  }
  return { name: unquoted, version: "UNKNOWN" };
}

function parseYarnBerry(doc: Record<string, unknown>, options?: { dev?: boolean }): LockfileParseResult {
  const warnings: string[] = [];
  const includeDev = options?.dev ?? false;
  const packages: PackageRecord[] = [];

  for (const [key, value] of Object.entries(doc)) {
    if (key === "__metadata") {
      continue;
    }
    const entry = value as { version?: string; dev?: boolean; license?: string };
    if (!includeDev && entry.dev) {
      continue;
    }
    const { name, version: parsedVersion } = parseBerryPackageKey(key);
    const version = (entry.version ?? parsedVersion).trim() || "UNKNOWN";
    const licenseSpdx = entry.license?.trim() || null;
    if (!licenseSpdx) {
      warnings.push(`no license information for ${name} ${version}`);
    }
    packages.push({
      name,
      version,
      ecosystem: "npm",
      licenseSpdx,
      licenseText: null,
      copyright: null,
      homepage: null,
      repository: null,
      description: null,
    });
  }

  return { documentName: "yarn-project", packages, warnings };
}

export function parseYarnLock(text: string, options?: { dev?: boolean }): LockfileParseResult {
  const trimmed = text.trimStart();
  if (trimmed.startsWith("__metadata:")) {
    const doc = YAML.parse(text) as Record<string, unknown>;
    if (!doc || typeof doc !== "object") {
      throw new YarnLockError("input is not a yarn.lock document", 2);
    }
    return parseYarnBerry(doc, options);
  }
  return parseYarnV1(text, options);
}

export async function loadYarnLockFromFile(
  path: string,
  options?: { dev?: boolean },
): Promise<LockfileParseResult> {
  let text: string;
  try {
    text = await readFile(path, "utf8");
  } catch {
    throw new YarnLockError("input could not be read", 2);
  }

  try {
    return parseYarnLock(text, options);
  } catch (err) {
    if (err instanceof YarnLockError) {
      throw err;
    }
    throw new YarnLockError("input could not be parsed as yarn.lock", 2);
  }
}

export class YarnLockError extends Error {
  readonly exitCode: number;

  constructor(message: string, exitCode = 2) {
    super(message);
    this.name = "YarnLockError";
    this.exitCode = exitCode;
  }
}