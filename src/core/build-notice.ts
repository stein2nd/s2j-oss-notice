import type { SbomParseResult } from "../adapters/sbom-types.js";
import type { OnotConfig } from "../adapters/onot-config.js";
import type { NoticeDocument } from "../types/notice.js";
import { normalizePackages } from "./normalizer.js";

export function buildNoticeDocument(
  spdx: SbomParseResult,
  _config: OnotConfig | null,
): NoticeDocument {
  const productName = spdx.documentName;
  const title = `OSS Notice for ${productName}`;
  const generatedAt = new Date().toISOString();

  return {
    title,
    generatedAt,
    packages: normalizePackages(spdx.packages),
    warnings: [...spdx.warnings],
  };
}