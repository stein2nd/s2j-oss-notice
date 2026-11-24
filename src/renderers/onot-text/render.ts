import type { ExtractedLicense, NoticeDocument } from "../../types/notice.js";
import { onotFooterLines } from "../onot-shared/footer.js";
import { buildLicenseBlocks, componentsRows } from "../onot-shared/licenses.js";

export function renderOnotText(doc: NoticeDocument, extracted: ExtractedLicense[]): string {
  const { blocks } = buildLicenseBlocks(doc.packages, extracted);
  const lines: string[] = [
    doc.title,
    "=".repeat(doc.title.length),
    "",
    "This product includes open source software components listed below.",
    "",
    "Components",
    "-".repeat(40),
  ];

  for (const pkg of componentsRows(doc)) {
    lines.push(`${pkg.name} ${pkg.version}`);
    lines.push(`  License: ${pkg.licenseSpdx ?? "(unknown)"}`);
    if (pkg.copyright) {
      lines.push(`  Copyright: ${pkg.copyright}`);
    }
    lines.push("");
  }

  lines.push("Licenses", "-".repeat(40));
  for (const block of blocks) {
    lines.push(`${block.heading} (${block.licenseId})`);
    lines.push(`Used by: ${block.usedBy.join(", ")}`);
    lines.push("");
    lines.push(block.text ?? "(License text not available offline.)");
    lines.push("-".repeat(40));
  }

  lines.push(...onotFooterLines());

  return `${lines.join("\n")}\n`;
}