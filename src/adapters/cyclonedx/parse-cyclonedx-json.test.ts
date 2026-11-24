import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { loadCycloneDxJsonFromFile } from "./parse-cyclonedx-json.js";

const fixtureDir = join(fileURLToPath(new URL(".", import.meta.url)), "../../../test/fixtures");

describe("loadCycloneDxJsonFromFile", () => {
  it("maps components and inline license refs", async () => {
    const result = await loadCycloneDxJsonFromFile(join(fixtureDir, "example.cdx.json"));
    expect(result.documentName).toBe("example-product");
    expect(result.packages.map((p) => p.name)).toEqual(["foo", "bar"]);
    expect(result.packages[0]?.licenseSpdx).toBe("MIT");
    expect(result.packages[1]?.licenseSpdx).toMatch(/^LicenseRef-/);
    expect(result.extractedLicenses.some((lic) => lic.extractText.includes("Bar"))).toBe(true);
  });
});