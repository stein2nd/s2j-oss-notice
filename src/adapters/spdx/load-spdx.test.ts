import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { detectInputKind } from "../detect-input.js";
import { detectSpdxSerialization } from "./serialization.js";
import { loadSpdxFromFile } from "./load-spdx.js";
import { readFile } from "node:fs/promises";

const fixtureDir = join(import.meta.dirname, "../../../test/fixtures");

describe("SPDX load", () => {
  it("detects yaml and json serializations", async () => {
    const yaml = await readFile(join(fixtureDir, "example.spdx.yaml"));
    const json = await readFile(join(fixtureDir, "example.spdx.json"));
    const tag = await readFile(join(fixtureDir, "example.spdx.tag"));
    expect(detectSpdxSerialization(yaml, "example.spdx.yaml")).toBe("yaml");
    expect(detectSpdxSerialization(json, "example.spdx.json")).toBe("json");
    expect(detectSpdxSerialization(tag, "example.spdx.tag")).toBe("tagvalue");
  });

  it("parses SPDX YAML", async () => {
    const result = await loadSpdxFromFile(join(fixtureDir, "example.spdx.yaml"));
    expect(result.documentName).toBe("example-product");
    expect(result.packages.find((p) => p.name === "foo")?.licenseSpdx).toBe("MIT");
  });

  it("parses SPDX Tag-Value", async () => {
    const result = await loadSpdxFromFile(join(fixtureDir, "example.spdx.tag"));
    expect(result.documentName).toBe("example-product-tag");
    expect(result.packages.map((p) => p.name)).toEqual(["foo", "bar"]);
  });

  it("detectInputKind recognizes SPDX YAML and CycloneDX XML", async () => {
    expect(await detectInputKind(join(fixtureDir, "example.spdx.yaml"))).toBe("spdx");
    expect(await detectInputKind(join(fixtureDir, "example.cdx.xml"))).toBe("cyclonedx");
  });
});