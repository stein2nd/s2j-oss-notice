import type { ExtractedLicense, NoticeDocument, PackageRecord } from "../../types/notice.js";
import { buildLicenseBlocks } from "../onot-shared/licenses.js";

function escapeTableCell(value: string): string {
  return value.replace(/\|/g, "\\|");
}

function componentsTable(packages: PackageRecord[]): string {
  const lines = [
    "| Name | Version | License |",
    "| --- | --- | --- |",
    ...packages.map((pkg) => {
      const license = pkg.licenseSpdx ?? "(unknown)";
      return `| ${escapeTableCell(pkg.name)} | ${escapeTableCell(pkg.version)} | ${escapeTableCell(license)} |`;
    }),
  ];
  return lines.join("\n");
}

function licenseTextsSection(
  packages: PackageRecord[],
  extracted: ExtractedLicense[],
): string[] {
  const { blocks } = buildLicenseBlocks(packages, extracted);
  if (blocks.length === 0) {
    return [];
  }

  const lines: string[] = ["## License texts", ""];
  for (const block of blocks) {
    lines.push(`### ${block.heading} (\`${block.licenseId}\`)`, "");
    lines.push(block.text ?? "(License text not available offline.)", "");
  }
  return lines;
}

export type AcknowledgementsRenderOptions = {
  extracted?: ExtractedLicense[];
};

export function renderAcknowledgementsMarkdown(
  doc: NoticeDocument,
  options?: AcknowledgementsRenderOptions,
): string {
  const parts = [
    `# ${doc.title}`,
    "",
    "This project uses the following open source packages.",
    "",
    "## Dependencies",
    "",
    componentsTable(doc.packages),
    "",
  ];

  if (options?.extracted && options.extracted.length > 0) {
    parts.push(...licenseTextsSection(doc.packages, options.extracted));
  }

  parts.push(`Generated at: ${doc.generatedAt}`, "");

  return parts.join("\n");
}