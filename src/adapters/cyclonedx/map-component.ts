import type { ExtractedLicense, PackageRecord } from "../../types/notice.js";
import type { CycloneDxComponent } from "./types.js";

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

export function licenseExpressionFromComponent(
  component: CycloneDxComponent,
  refs: Map<string, ExtractedLicense>,
): string | null {
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

export function mapCycloneDxComponent(
  component: CycloneDxComponent,
  refs: Map<string, ExtractedLicense>,
  warnings: string[],
): PackageRecord | null {
  const name = component.name?.trim();
  if (!name) {
    warnings.push("skipped CycloneDX component without name");
    return null;
  }
  const version = (component.version ?? "").trim() || "UNKNOWN";
  const licenseSpdx = licenseExpressionFromComponent(component, refs);

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