import { describe, expect, it } from "vitest";

import { resolveExtractedLicenses } from "./resolve-licenses.js";

describe("resolveExtractedLicenses", () => {
  it("fills MIT from bundled catalog when offline", async () => {
    const { extracted, warnings } = await resolveExtractedLicenses(
      [
        {
          name: "foo",
          version: "1.0.0",
          ecosystem: "cyclonedx",
          licenseSpdx: "MIT",
          licenseText: null,
          copyright: null,
          homepage: null,
          repository: null,
          description: null,
        },
      ],
      [],
      { offline: true },
    );

    const mit = extracted.find((lic) => lic.licenseId === "MIT");
    expect(mit?.extractText).toContain("Permission is hereby granted");
    expect(warnings).toEqual([]);
  });

  it("uses injected fetcher when online", async () => {
    const { extracted } = await resolveExtractedLicenses(
      [
        {
          name: "pkg",
          version: "1.0.0",
          ecosystem: "spdx",
          licenseSpdx: "WMTP",
          licenseText: null,
          copyright: null,
          homepage: null,
          repository: null,
          description: null,
        },
      ],
      [],
      {
        offline: false,
        fetchLicense: async () => ({ text: "BSD text from network", isException: false }),
      },
    );

    expect(extracted.find((lic) => lic.licenseId === "WMTP")?.extractText).toBe(
      "BSD text from network",
    );
  });
});