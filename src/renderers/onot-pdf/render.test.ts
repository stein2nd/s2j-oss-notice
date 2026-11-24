import { describe, expect, it } from "vitest";

import type { NoticeDocument } from "../../types/notice.js";
import { renderOnotPdf } from "./render.js";

function manyPackages(count: number): NoticeDocument["packages"] {
  return Array.from({ length: count }, (_, index) => ({
    name: `package-${index}`,
    version: "1.0.0",
    ecosystem: "npm" as const,
    licenseSpdx: "MIT",
    licenseText: null,
    copyright: `Copyright ${index}`,
    homepage: null,
    repository: null,
    description: null,
  }));
}

describe("renderOnotPdf", () => {
  it("emits multi-page PDF for large notices", () => {
    const doc: NoticeDocument = {
      title: "OSS Notice for Many Packages",
      generatedAt: "2026-01-01T00:00:00.000Z",
      packages: manyPackages(80),
      warnings: [],
    };
    const pdf = renderOnotPdf(doc, []);
    const text = new TextDecoder().decode(pdf);
    expect(text).toMatch(/\/Count [2-9]/);
    expect(text).toContain("Offer of Source Code");
    expect(text).toContain("Page 1 of");
  });
});