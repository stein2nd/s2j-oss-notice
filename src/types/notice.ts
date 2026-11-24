export type PackageRecord = {
  name: string;
  version: string;
  ecosystem: "spdx" | "cyclonedx" | "composer" | "npm" | "unknown";
  licenseSpdx: string | null;
  licenseText: string | null;
  copyright: string | null;
  homepage: string | null;
  repository: string | null;
  description: string | null;
};

export type NoticeDocument = {
  title: string;
  generatedAt: string;
  packages: PackageRecord[];
  warnings: string[];
};

export type ExtractedLicense = {
  licenseId: string;
  name: string;
  extractText: string;
};