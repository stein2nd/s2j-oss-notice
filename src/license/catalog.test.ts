import { describe, expect, it } from "vitest";

import { bundledCatalogEntryCount, bundledCatalogVersion, lookupBundledLicense } from "./catalog.js";

describe("SPDX bundled catalog (L1)", () => {
  it("vendors onot-scale license list", () => {
    expect(bundledCatalogEntryCount()).toBeGreaterThan(700);
    expect(bundledCatalogVersion()).toMatch(/^\d/);
  });

  it("resolves MIT offline", () => {
    const mit = lookupBundledLicense("MIT");
    expect(mit?.name).toContain("MIT");
    expect(mit?.text).toContain("Permission is hereby granted");
  });
});