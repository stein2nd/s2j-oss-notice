import { describe, expect, it } from "vitest";

import type { LockfileParseResult } from "./lockfile-types.js";
import { mergeLockfileResults } from "./merge-lockfiles.js";

describe("mergeLockfileResults", () => {
  it("deduplicates packages by ecosystem, name, and version", () => {
    const a: LockfileParseResult = {
      documentName: "a",
      warnings: [],
      packages: [
        {
          name: "left-pad",
          version: "1.0.0",
          ecosystem: "npm",
          licenseSpdx: "MIT",
          licenseText: null,
          copyright: null,
          homepage: null,
          repository: null,
          description: null,
        },
      ],
    };
    const b: LockfileParseResult = {
      documentName: "b",
      warnings: ["warn"],
      packages: [
        {
          name: "left-pad",
          version: "1.0.0",
          ecosystem: "npm",
          licenseSpdx: "MIT",
          licenseText: null,
          copyright: null,
          homepage: null,
          repository: null,
          description: null,
        },
        {
          name: "lodash",
          version: "4.17.21",
          ecosystem: "npm",
          licenseSpdx: "MIT",
          licenseText: null,
          copyright: null,
          homepage: null,
          repository: null,
          description: null,
        },
      ],
    };

    const merged = mergeLockfileResults([a, b]);
    expect(merged.packages).toHaveLength(2);
    expect(merged.documentName).toBe("a+b");
    expect(merged.warnings).toEqual(["warn"]);
  });
});