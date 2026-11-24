import { readFile } from "node:fs/promises";

import type { SbomParseResult } from "../sbom-types.js";
import type { ExtractedLicense, PackageRecord } from "../../types/notice.js";
import type { SpdxDocument, SpdxPackage } from "./types.js";

export type ParseSpdxResult = SbomParseResult;

function pickLicense(pkg: SpdxPackage): string | null {
  const raw = (pkg.licenseConcluded ?? pkg.licenseDeclared ?? "").trim();
  if (!raw || raw === "NOASSERTION" || raw === "NONE") {
    return null;
  }
  return raw;
}

function mapPackage(pkg: SpdxPackage, warnings: string[]): PackageRecord | null {
  const name = pkg.name?.trim();
  if (!name) {
    warnings.push("skipped SPDX package without name");
    return null;
  }

  const version = (pkg.versionInfo ?? "").trim() || "UNKNOWN";

  const repository =
    pkg.externalRefs?.find((ref) => ref.referenceType?.toLowerCase() === "purl")?.referenceLocator ??
    null;

  return {
    name,
    version,
    ecosystem: "spdx",
    licenseSpdx: pickLicense(pkg),
    licenseText: null,
    copyright: pkg.copyrightText?.trim() || null,
    homepage: pkg.homepage?.trim() || null,
    repository,
    description: pkg.description?.trim() || null,
  };
}

export function parseSpdxDocument(doc: SpdxDocument): ParseSpdxResult {
  const warnings: string[] = [];
  const packages: PackageRecord[] = [];

  for (const pkg of doc.packages ?? []) {
    const mapped = mapPackage(pkg, warnings);
    if (mapped) {
      if (!mapped.licenseSpdx) {
        warnings.push(`no license information for ${mapped.name} ${mapped.version}`);
      }
      packages.push(mapped);
    }
  }

  const extractedLicenses: ExtractedLicense[] = (doc.hasExtractedLicensingInfos ?? [])
    .filter((info) => info.licenseId && info.extractText?.trim())
    .map((info) => ({
      licenseId: info.licenseId,
      name: info.name?.trim() || info.licenseId,
      extractText: info.extractText!.trim(),
    }));

  const documentName = doc.name?.trim() || "unknown-product";

  return { documentName, packages, extractedLicenses, warnings };
}

export async function loadSpdxJsonFromFile(path: string): Promise<ParseSpdxResult> {
  const text = await readFile(path, "utf8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw new SpdxParseError("input could not be parsed as JSON", 2);
  }

  if (!parsed || typeof parsed !== "object") {
    throw new SpdxParseError("input is not a SPDX JSON document", 2);
  }

  return parseSpdxDocument(parsed as SpdxDocument);
}

export class SpdxParseError extends Error {
  readonly exitCode: number;

  constructor(message: string, exitCode = 2) {
    super(message);
    this.name = "SpdxParseError";
    this.exitCode = exitCode;
  }
}