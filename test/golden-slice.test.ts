import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { parseSpdxDocument } from "../src/adapters/spdx/parse-spdx-json.js";
import { normalizeNoticeMarkdown } from "../src/compat/normalize-notice-md.js";
import { buildNoticeDocument } from "../src/core/build-notice.js";
import { resolveExtractedLicenses } from "../src/license/resolve-licenses.js";
import { renderOnotMarkdown } from "../src/renderers/onot-markdown/render.js";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const fixtureDir = join(root, "test/fixtures");
const goldenDir = join(root, "test/golden");

describe("onot golden slice (L1)", () => {
  it("matches slice_notice.md after normalization", async () => {
    const raw = JSON.parse(readFileSync(join(fixtureDir, "slice.spdx.json"), "utf8"));
    const spdx = parseSpdxDocument(raw);
    const notice = buildNoticeDocument(spdx, null);
    const { extracted } = await resolveExtractedLicenses(notice.packages, spdx.extractedLicenses, {
      offline: true,
    });
    const { content } = renderOnotMarkdown(notice, extracted);
    const golden = readFileSync(join(goldenDir, "slice_notice.md"), "utf8");

    expect(normalizeNoticeMarkdown(content)).toBe(normalizeNoticeMarkdown(golden));
  });
});