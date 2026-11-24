import { mkdtemp, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { runGenerate } from "./generate.js";

const fixtureDir = join(fileURLToPath(new URL(".", import.meta.url)), "../../test/fixtures");

describe("runGenerate (L1)", () => {
  it("writes OSS_Notice_*.md under output directory", async () => {
    const outDir = await mkdtemp(join(tmpdir(), "s2j-oss-notice-"));
    const input = join(fixtureDir, "slice-minimal.spdx.json");

    const result = await runGenerate({
      input,
      format: "md",
      outputDir: outDir,
      configPath: join(fixtureDir, "onot.yaml"),
    });

    expect(result.outputPath).toMatch(/OSS_Notice_SPDX-Tools-v2\.0_/);
    expect(result.written).toHaveLength(1);

    const files = await readdir(outDir);
    expect(files.some((f) => f.startsWith("OSS_Notice_") && f.endsWith(".md"))).toBe(true);

    const md = await readFile(result.outputPath!, "utf8");
    expect(md).toContain("## Components");
  });
});