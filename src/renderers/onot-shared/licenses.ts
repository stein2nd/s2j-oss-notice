import { lookupBundledLicense } from "../../license/catalog.js";
import type { ExtractedLicense, NoticeDocument, PackageRecord } from "../../types/notice.js";

export type LicenseBlock = {
  licenseId: string;
  heading: string;
  usedBy: string[];
  text: string | null;
};

function tokenizeLicenseIds(expression: string): string[] {
  const normalized = expression.replace(/[()]/g, " ");
  const parts = normalized.split(/\s+(?:AND|OR)\s+|\s+WITH\s+/i);
  const ids = parts.map((part) => part.trim()).filter((part) => part.length > 0);
  return [...new Set(ids)];
}

export function buildLicenseBlocks(
  packages: PackageRecord[],
  extracted: ExtractedLicense[],
): { blocks: LicenseBlock[]; warnings: string[] } {
  const warnings: string[] = [];
  const byId = new Map<string, ExtractedLicense>();
  for (const lic of extracted) {
    byId.set(lic.licenseId, lic);
  }

  const usedBy = new Map<string, string[]>();
  for (const pkg of packages) {
    if (!pkg.licenseSpdx) {
      continue;
    }
    for (const id of tokenizeLicenseIds(pkg.licenseSpdx)) {
      const list = usedBy.get(id) ?? [];
      list.push(`${pkg.name} ${pkg.version}`);
      usedBy.set(id, list);
    }
  }

  const blocks: LicenseBlock[] = [];
  for (const [licenseId, users] of usedBy.entries()) {
    const extractedInfo = byId.get(licenseId);
    const catalog = lookupBundledLicense(licenseId);
    const text = extractedInfo?.extractText?.trim() || catalog?.text || null;
    if (!text) {
      warnings.push(`missing license text for ${licenseId}`);
    }
    blocks.push({
      licenseId,
      heading: extractedInfo?.name?.trim() || catalog?.name || licenseId,
      usedBy: [...users].sort((a, b) => a.localeCompare(b, "en")),
      text,
    });
  }

  blocks.sort((a, b) => (a.licenseId < b.licenseId ? -1 : a.licenseId > b.licenseId ? 1 : 0));

  return { blocks, warnings };
}

export function componentsRows(doc: NoticeDocument): PackageRecord[] {
  return doc.packages;
}