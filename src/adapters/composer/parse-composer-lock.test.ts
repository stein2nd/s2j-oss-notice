import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { parseComposerLock } from "./parse-composer-lock.js";

const fixtureDir = join(fileURLToPath(new URL(".", import.meta.url)), "../../../test/fixtures");

describe("parseComposerLock", () => {
  it("parses packages and dev packages", () => {
    const raw = JSON.parse(readFileSync(join(fixtureDir, "minimal.composer.lock"), "utf8"));
    const withDev = parseComposerLock(raw, { dev: true });
    expect(withDev.packages).toHaveLength(3);

    const prodOnly = parseComposerLock(raw, { dev: false });
    expect(prodOnly.packages).toHaveLength(2);
  });
});