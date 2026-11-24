import type { ExtractedLicense, PackageRecord } from "../types/notice.js";

export type SbomParseResult = {
  documentName: string;
  packages: PackageRecord[];
  extractedLicenses: ExtractedLicense[];
  warnings: string[];
};