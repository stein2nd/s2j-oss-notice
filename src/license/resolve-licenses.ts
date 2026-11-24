import type { ExtractedLicense, PackageRecord } from "../types/notice.js";
import { lookupBundledLicenseText } from "./catalog.js";
import { fetchSpdxLicenseText } from "./fetcher.js";

export type ResolveLicenseOptions = {
  offline: boolean;
  fetchLicense?: typeof fetchSpdxLicenseText;
};

function tokenizeLicenseIds(expression: string): string[] {
  const normalized = expression.replace(/[()]/g, " ");
  const parts = normalized.split(/\s+(?:AND|OR)\s+|\s+WITH\s+/i);
  const ids = parts.map((part) => part.trim()).filter((part) => part.length > 0);
  return [...new Set(ids)];
}

function collectLicenseIds(packages: PackageRecord[]): string[] {
  const ids = new Set<string>();
  for (const pkg of packages) {
    if (!pkg.licenseSpdx) {
      continue;
    }
    for (const id of tokenizeLicenseIds(pkg.licenseSpdx)) {
      ids.add(id);
    }
  }
  return [...ids];
}

function upsertExtracted(
  map: Map<string, ExtractedLicense>,
  licenseId: string,
  name: string,
  extractText: string,
): void {
  const existing = map.get(licenseId);
  if (existing?.extractText?.trim()) {
    return;
  }
  map.set(licenseId, {
    licenseId,
    name: existing?.name || name,
    extractText,
  });
}

export async function resolveExtractedLicenses(
  packages: PackageRecord[],
  seed: ExtractedLicense[],
  options: ResolveLicenseOptions,
): Promise<{ extracted: ExtractedLicense[]; warnings: string[] }> {
  const map = new Map<string, ExtractedLicense>();
  for (const lic of seed) {
    map.set(lic.licenseId, { ...lic });
  }

  const fetcher = options.fetchLicense ?? fetchSpdxLicenseText;
  const warnings: string[] = [];

  for (const licenseId of collectLicenseIds(packages)) {
    const current = map.get(licenseId);
    if (current?.extractText?.trim()) {
      continue;
    }

    const bundled = lookupBundledLicenseText(licenseId);
    if (bundled) {
      upsertExtracted(map, licenseId, bundled.name, bundled.text);
      continue;
    }

    if (licenseId.startsWith("LicenseRef-")) {
      continue;
    }

    if (options.offline) {
      continue;
    }

    const remote = await fetcher(licenseId);
    if (remote?.text) {
      upsertExtracted(map, licenseId, licenseId, remote.text);
      continue;
    }

    warnings.push(`unknown license: ${licenseId}`);
  }

  const extracted = [...map.values()].sort((a, b) => a.licenseId.localeCompare(b.licenseId));
  return { extracted, warnings };
}