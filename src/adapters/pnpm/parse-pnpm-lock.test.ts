import { readFileSync } from "node:fs";
import { join } from "node:path";
import YAML from "yaml";
import { describe, expect, it } from "vitest";

import { parsePnpmLock } from "./parse-pnpm-lock.js";

const fixtureDir = join(import.meta.dirname, "../../../test/fixtures");

describe("parsePnpmLock", () => {
  it("parses packages with license", () => {
    const text = readFileSync(join(fixtureDir, "minimal.pnpm-lock.yaml"), "utf8");
    const doc = YAML.parse(text);
    const result = parsePnpmLock(doc);
    expect(result.packages).toHaveLength(1);
    expect(result.packages[0]?.name).toBe("left-pad");
    expect(result.packages[0]?.licenseSpdx).toBe("MIT");
  });
});