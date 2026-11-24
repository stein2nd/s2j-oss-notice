import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { parseSpdxDocument } from "../../adapters/spdx/parse-spdx-json.js";
import { buildNoticeDocument } from "../../core/build-notice.js";
import { renderOnotMarkdown } from "./render.js";

const fixtureDir = join(fileURLToPath(new URL(".", import.meta.url)), "../../../test/fixtures");

describe("renderOnotMarkdown", () => {
  it("emits Components and Licenses sections", () => {
    const raw = JSON.parse(readFileSync(join(fixtureDir, "slice-minimal.spdx.json"), "utf8"));
    const spdx = parseSpdxDocument(raw);
    const doc = buildNoticeDocument(spdx, null);
    const { content } = renderOnotMarkdown(doc, spdx.extractedLicenses);

    expect(content).toContain("# OSS Notice for SPDX-Tools-v2.0");
    expect(content).toContain("## Components");
    expect(content).toContain("| Apache Commons Lang |");
    expect(content).toContain("## Licenses");
    expect(content).toContain("### BSD 3-Clause");
    expect(content).toContain("### MIT");
  });
});