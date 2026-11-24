import { readFile } from "node:fs/promises";
import YAML from "yaml";

import type { PackageRecord } from "../../types/notice.js";
import type { LockfileParseResult } from "../lockfile-types.js";

type PnpmPackageEntry = {
  dev?: boolean;
  optional?: boolean;
  license?: string;
};

type PnpmLockDocument = {
  lockfileVersion?: string | number;
  packages?: Record<string, PnpmPackageEntry>;
};

export function parsePnpmPackageKey(key: string): { name: string; version: string } {
  const normalized = key.startsWith("/") ? key.slice(1) : key;
  const at = normalized.lastIndexOf("@");
  if (at <= 0) {
    return { name: normalized, version: "UNKNOWN" };
  }
  return {
    name: normalized.slice(0, at),
    version: normalized.slice(at + 1),
  };
}

export function parsePnpmLock(doc: PnpmLockDocument, options?: { dev?: boolean }): LockfileParseResult {
  const warnings: string[] = [];
  const includeDev = options?.dev ?? false;
  const packages: PackageRecord[] = [];

  for (const [key, meta] of Object.entries(doc.packages ?? {})) {
    if (!includeDev && meta.dev) {
      continue;
    }
    const { name, version } = parsePnpmPackageKey(key);
    const licenseSpdx = meta.license?.trim() || null;
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

  const documentName = "pnpm-project";

  return { documentName, packages, warnings };
}

export async function loadPnpmLockFromFile(
  path: string,
  options?: { dev?: boolean },
): Promise<LockfileParseResult> {
  let text: string;
  try {
    text = await readFile(path, "utf8");
  } catch {
    throw new PnpmLockError("input could not be read", 2);
  }

  let parsed: unknown;
  try {
    parsed = YAML.parse(text);
  } catch {
    throw new PnpmLockError("input could not be parsed as YAML", 2);
  }

  if (!parsed || typeof parsed !== "object") {
    throw new PnpmLockError("input is not a pnpm-lock.yaml document", 2);
  }

  return parsePnpmLock(parsed as PnpmLockDocument, options);
}

export class PnpmLockError extends Error {
  readonly exitCode: number;

  constructor(message: string, exitCode = 2) {
    super(message);
    this.name = "PnpmLockError";
    this.exitCode = exitCode;
  }
}