import { readFile } from "node:fs/promises";

import type { PackageRecord } from "../../types/notice.js";

type ComposerLockPackage = {
  name?: string;
  version?: string;
  license?: string | string[];
  homepage?: string;
  source?: { url?: string };
  dist?: { url?: string };
};

type ComposerLock = {
  packages?: ComposerLockPackage[];
  "packages-dev"?: ComposerLockPackage[];
  includeDev?: boolean;
};

export type ParseComposerLockResult = {
  documentName: string;
  packages: PackageRecord[];
  warnings: string[];
};

function formatLicense(license: string | string[] | undefined): string | null {
  if (!license) {
    return null;
  }
  if (Array.isArray(license)) {
    return license.join(" OR ");
  }
  return license.trim() || null;
}

function mapPackage(pkg: ComposerLockPackage, warnings: string[]): PackageRecord | null {
  const name = pkg.name?.trim();
  if (!name) {
    warnings.push("skipped composer package without name");
    return null;
  }
  const version = (pkg.version ?? "").trim() || "UNKNOWN";
  const licenseSpdx = formatLicense(pkg.license);
  if (!licenseSpdx) {
    warnings.push(`no license information for ${name} ${version}`);
  }
  return {
    name,
    version,
    ecosystem: "composer",
    licenseSpdx,
    licenseText: null,
    copyright: null,
    homepage: pkg.homepage?.trim() || null,
    repository: pkg.source?.url?.trim() || null,
    description: null,
  };
}

export function parseComposerLock(doc: ComposerLock, options?: { dev?: boolean }): ParseComposerLockResult {
  const warnings: string[] = [];
  const includeDev = options?.dev ?? true;
  const raw: ComposerLockPackage[] = [...(doc.packages ?? [])];
  if (includeDev) {
    raw.push(...(doc["packages-dev"] ?? []));
  }

  const packages: PackageRecord[] = [];
  for (const pkg of raw) {
    const mapped = mapPackage(pkg, warnings);
    if (mapped) {
      packages.push(mapped);
    }
  }

  const root = doc.packages?.[0]?.name?.split("/")[0] ?? "project";
  const documentName = root;

  return { documentName, packages, warnings };
}

export async function loadComposerLockFromFile(
  path: string,
  options?: { dev?: boolean },
): Promise<ParseComposerLockResult> {
  let text: string;
  try {
    text = await readFile(path, "utf8");
  } catch {
    throw new ComposerLockError("input could not be read", 2);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ComposerLockError("input could not be parsed as JSON", 2);
  }

  return parseComposerLock(parsed as ComposerLock, options);
}

export class ComposerLockError extends Error {
  readonly exitCode: number;

  constructor(message: string, exitCode = 2) {
    super(message);
    this.name = "ComposerLockError";
    this.exitCode = exitCode;
  }
}