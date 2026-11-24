import { readFile } from "node:fs/promises";

import type { ExtractedLicense, PackageRecord } from "../../types/notice.js";
import type { SbomParseResult } from "../sbom-types.js";
import type { CycloneDxBom, CycloneDxComponent } from "./types.js";

export class CycloneDxParseError extends Error {
  readonly exitCode = 2;

  constructor(message: string) {
    super(message);
    this.name = "CycloneDxParseError";
  }
}

function slugifyLicenseRef(name: string): string {
  const base = name
    .trim()
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `LicenseRef-${base || "custom"}`;
}

function registerNamedLicense(
  name: string,
  text: string,
  refs: Map<string, ExtractedLicense>,
): string {
  const baseId = slugifyLicenseRef(name);
  let candidate = baseId;
  let suffix = 2;
  while (refs.has(candidate)) {
    const existing = refs.get(candidate)!;
    if (existing.name === name && existing.extractText === text) {
      return candidate;
    }
    candidate = `${baseId}-${suffix}`;
    suffix += 1;
  }
  refs.set(candidate, {
    licenseId: candidate,
    name,
    extractText: text,
  });
  return candidate;
}

function licenseExpression(component: CycloneDxComponent, refs: Map<string, ExtractedLicense>): string | null {
  const parts: string[] = [];
  for (const entry of component.licenses ?? []) {
    if (entry.expression?.trim()) {
      parts.push(entry.expression.trim());
      continue;
    }
    const lic = entry.license;
    if (!lic) {
      continue;
    }
    if (lic.id?.trim()) {
      parts.push(lic.id.trim());
      continue;
    }
    const name = lic.name?.trim();
    if (name) {
      const text = lic.text?.content?.trim() ?? "";
      parts.push(registerNamedLicense(name, text, refs));
    }
  }
  if (parts.length === 0) {
    return null;
  }
  return parts.length === 1 ? parts[0]! : parts.join(" AND ");
}

function mapComponent(component: CycloneDxComponent, refs: Map<string, ExtractedLicense>, warnings: string[]): PackageRecord | null {
  const name = component.name?.trim();
  if (!name) {
    warnings.push("skipped CycloneDX component without name");
    return null;
  }
  const version = (component.version ?? "").trim() || "UNKNOWN";
  const licenseSpdx = licenseExpression(component, refs);

  return {
    name,
    version,
    ecosystem: "cyclonedx",
    licenseSpdx,
    licenseText: null,
    copyright: component.copyright?.trim() || null,
    homepage: null,
    repository: component.purl?.trim() || null,
    description: null,
  };
}

export function parseCycloneDxDocument(doc: CycloneDxBom): SbomParseResult {
  const warnings: string[] = [];
  const refs = new Map<string, ExtractedLicense>();
  const packages: PackageRecord[] = [];

  for (const component of doc.components ?? []) {
    const mapped = mapComponent(component, refs, warnings);
    if (!mapped) {
      continue;
    }
    if (!mapped.licenseSpdx) {
      warnings.push(`no license information for ${mapped.name} ${mapped.version}`);
    }
    packages.push(mapped);
  }

  const metadataName = doc.metadata?.component?.name?.trim();
  const documentName = metadataName || "unknown-product";

  return {
    documentName,
    packages,
    extractedLicenses: [...refs.values()],
    warnings,
  };
}

export async function loadCycloneDxJsonFromFile(path: string): Promise<SbomParseResult> {
  const text = await readFile(path, "utf8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw new CycloneDxParseError("input could not be parsed as JSON");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new CycloneDxParseError("input is not a CycloneDX JSON document");
  }

  const doc = parsed as CycloneDxBom;
  const format = doc.bomFormat?.toLowerCase();
  if (format && format !== "cyclonedx") {
    throw new CycloneDxParseError(`unsupported bomFormat: ${doc.bomFormat}`);
  }

  return parseCycloneDxDocument(doc);
}
