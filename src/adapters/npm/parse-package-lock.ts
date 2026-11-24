import { readFile } from "node:fs/promises";

import type { PackageRecord } from "../../types/notice.js";

type NpmLockPackage = {
  name?: string;
  version?: string;
  license?: string | { type?: string; license?: string };
  resolved?: string;
  dev?: boolean;
  link?: boolean;
};

type PackageLockV2 = {
  lockfileVersion?: number;
  name?: string;
  packages?: Record<string, NpmLockPackage>;
  dependencies?: Record<string, NpmLockPackage & { dependencies?: unknown }>;
};

export type ParsePackageLockResult = {
  documentName: string;
  packages: PackageRecord[];
  warnings: string[];
};

function formatNpmLicense(
  license: string | { type?: string; license?: string } | undefined,
): string | null {
  if (!license) {
    return null;
  }
  if (typeof license === "string") {
    return license.trim() || null;
  }
  const fromObject = license.license ?? license.type;
  return fromObject?.trim() || null;
}

function packageNameFromPath(path: string, meta: NpmLockPackage): string {
  if (path === "") {
    return meta.name?.trim() || "root";
  }
  const prefix = "node_modules/";
  if (path.startsWith(prefix)) {
    return path.slice(prefix.length);
  }
  return meta.name?.trim() || path;
}

function mapPackagesV2(
  doc: PackageLockV2,
  options: { dev?: boolean },
  warnings: string[],
): PackageRecord[] {
  const packages: PackageRecord[] = [];
  const includeDev = options.dev ?? false;

  for (const [path, meta] of Object.entries(doc.packages ?? {})) {
    if (path === "") {
      continue;
    }
    if (!includeDev && meta.dev) {
      continue;
    }
    const name = packageNameFromPath(path, meta);
    const version = (meta.version ?? "").trim() || "UNKNOWN";
    const licenseSpdx = formatNpmLicense(meta.license);
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
      repository: meta.resolved?.trim() || null,
      description: null,
    });
  }

  return packages;
}

type NpmLockV1Node = NpmLockPackage & {
  dependencies?: Record<string, NpmLockV1Node>;
};

function mapPackagesV1(doc: PackageLockV2, warnings: string[]): PackageRecord[] {
  const packages: PackageRecord[] = [];

  function walk(deps: Record<string, NpmLockV1Node> | undefined) {
    if (!deps) {
      return;
    }
    for (const [name, meta] of Object.entries(deps)) {
      const version = (meta.version ?? "").trim() || "UNKNOWN";
      const licenseSpdx = formatNpmLicense(meta.license);
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
      walk(meta.dependencies);
    }
  }

  walk(doc.dependencies as Record<string, NpmLockV1Node> | undefined);
  return packages;
}

export function parsePackageLock(doc: PackageLockV2, options?: { dev?: boolean }): ParsePackageLockResult {
  const warnings: string[] = [];
  const lockVersion = doc.lockfileVersion ?? 1;

  const packages =
    lockVersion >= 2
      ? mapPackagesV2(doc, { dev: options?.dev }, warnings)
      : mapPackagesV1(doc, warnings);

  const documentName = doc.name?.trim() || doc.packages?.[""]?.name?.trim() || "project";

  return { documentName, packages, warnings };
}

export async function loadPackageLockFromFile(
  path: string,
  options?: { dev?: boolean },
): Promise<ParsePackageLockResult> {
  let text: string;
  try {
    text = await readFile(path, "utf8");
  } catch {
    throw new PackageLockError("input could not be read", 2);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new PackageLockError("input could not be parsed as JSON", 2);
  }

  return parsePackageLock(parsed as PackageLockV2, options);
}

export class PackageLockError extends Error {
  readonly exitCode: number;

  constructor(message: string, exitCode = 2) {
    super(message);
    this.name = "PackageLockError";
    this.exitCode = exitCode;
  }
}