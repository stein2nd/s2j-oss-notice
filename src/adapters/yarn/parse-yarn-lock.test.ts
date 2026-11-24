import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { parseYarnLock } from "./parse-yarn-lock.js";

const fixtureDir = join(import.meta.dirname, "../../../test/fixtures");

describe("parseYarnLock", () => {
  it("parses yarn v1 lockfile", () => {
    const text = readFileSync(join(fixtureDir, "minimal.yarn.lock"), "utf8");
    const result = parseYarnLock(text);
    expect(result.packages).toHaveLength(1);
    expect(result.packages[0]?.name).toBe("left-pad");
    expect(result.packages[0]?.licenseSpdx).toBe("MIT");
  });
});