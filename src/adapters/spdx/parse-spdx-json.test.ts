import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { parseSpdxDocument } from "./parse-spdx-json.js";

const fixtureDir = join(fileURLToPath(new URL(".", import.meta.url)), "../../../test/fixtures");

describe("parseSpdxDocument", () => {
  it("maps packages from SPDX JSON", () => {
    const raw = JSON.parse(readFileSync(join(fixtureDir, "slice-minimal.spdx.json"), "utf8"));
    const result = parseSpdxDocument(raw);

    expect(result.documentName).toBe("SPDX-Tools-v2.0");
    expect(result.packages).toHaveLength(2);
    expect(result.packages[0]?.name).toBe("Apache Commons Lang");
    expect(result.extractedLicenses).toHaveLength(2);
  });
});