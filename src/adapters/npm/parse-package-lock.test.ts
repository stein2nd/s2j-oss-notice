import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { parsePackageLock } from "./parse-package-lock.js";

const fixtureDir = join(fileURLToPath(new URL(".", import.meta.url)), "../../../test/fixtures");

describe("parsePackageLock", () => {
  it("parses lockfileVersion 3 packages", () => {
    const raw = JSON.parse(readFileSync(join(fixtureDir, "minimal.package-lock.json"), "utf8"));
    const prod = parsePackageLock(raw, { dev: false });
    expect(prod.packages).toHaveLength(1);
    expect(prod.packages[0]?.name).toBe("lodash");

    const withDev = parsePackageLock(raw, { dev: true });
    expect(withDev.packages).toHaveLength(2);
  });
});