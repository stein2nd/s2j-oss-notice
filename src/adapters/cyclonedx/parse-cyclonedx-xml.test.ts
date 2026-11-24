import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { CycloneDxParseError } from "./parse-cyclonedx-json.js";
import { loadCycloneDxFromFile } from "./load-cyclonedx.js";
import { loadCycloneDxXmlFromFile } from "./parse-cyclonedx-xml.js";

const fixtureDir = join(import.meta.dirname, "../../../test/fixtures");

describe("CycloneDX XML", () => {
  it("parses example.cdx.xml", async () => {
    const result = await loadCycloneDxXmlFromFile(join(fixtureDir, "example.cdx.xml"));
    expect(result.documentName).toBe("example-product");
    expect(result.packages.map((p) => p.name).sort()).toEqual(["baz", "foo"]);
    expect(result.packages.find((p) => p.name === "foo")?.licenseSpdx).toBe("MIT");
    expect(result.packages.find((p) => p.name === "baz")?.licenseSpdx).toBe("Apache-2.0 OR MIT");
  });

  it("rejects XXE payloads", async () => {
    const data = await readFile(join(fixtureDir, "xxe.cdx.xml"));
    await expect(loadCycloneDxXmlFromFile(join(fixtureDir, "xxe.cdx.xml"))).rejects.toBeInstanceOf(
      CycloneDxParseError,
    );
    expect(data.toString("utf8")).toContain("<!DOCTYPE");
  });

  it("loadCycloneDxFromFile dispatches XML by extension", async () => {
    const result = await loadCycloneDxFromFile(join(fixtureDir, "example.cdx.xml"));
    expect(result.documentName).toBe("example-product");
  });
});