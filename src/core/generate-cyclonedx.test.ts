import { mkdtemp, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { runGenerate } from "./generate.js";

const fixtureDir = join(fileURLToPath(new URL(".", import.meta.url)), "../../test/fixtures");

describe("runGenerate (L3 CycloneDX)", () => {
  it("writes md and pdf from CycloneDX JSON", async () => {
    const outDir = await mkdtemp(join(tmpdir(), "s2j-cdx-"));
    const result = await runGenerate({
      input: join(fixtureDir, "example.cdx.json"),
      formats: ["md", "pdf"],
      outputDir: outDir,
      offline: true,
    });

    expect(result.product).toBe("example-product");
    expect(result.written).toHaveLength(2);

    const mdPath = result.written?.find((w) => w.format === "md")?.path;
    const pdfPath = result.written?.find((w) => w.format === "pdf")?.path;
    expect(mdPath).toBeDefined();
    expect(pdfPath).toBeDefined();

    const md = await readFile(mdPath!, "utf8");
    expect(md).toContain("MIT");
    expect(md).toContain("Custom Bar License");

    const pdf = await readFile(pdfPath!);
    expect(pdf.subarray(0, 5).toString("utf8")).toBe("%PDF-");
    expect((await stat(pdfPath!)).size).toBeGreaterThan(100);
  });
});