import { mkdtemp, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { GenerateError, runGenerate } from "./generate.js";

const fixtureDir = join(fileURLToPath(new URL(".", import.meta.url)), "../../test/fixtures");

describe("runGenerate (L0 lockfile)", () => {
  it("writes ACKNOWLEDGEMENTS-style markdown from composer.lock", async () => {
    const outFile = join(await mkdtemp(join(tmpdir(), "s2j-oss-out-")), "ACKNOWLEDGEMENTS.md");
    const result = await runGenerate({
      input: join(fixtureDir, "minimal.composer.lock"),
      format: "md",
      outFile,
      includeDev: false,
    });

    expect(result.outputPath).toBe(outFile);
    const md = await readFile(outFile, "utf8");
    expect(md).toContain("# Open Source Acknowledgements");
    expect(md).toContain("psr/log");
    expect(md).not.toContain("phpunit/phpunit");
  });

  it("writes from pnpm-lock.yaml", async () => {
    const outFile = join(await mkdtemp(join(tmpdir(), "s2j-oss-pnpm-")), "ACK.md");
    await runGenerate({
      input: join(fixtureDir, "minimal.pnpm-lock.yaml"),
      format: "md",
      outFile,
    });
    const md = await readFile(outFile, "utf8");
    expect(md).toContain("left-pad");
  });

  it("merges composer and npm lockfiles", async () => {
    const outFile = join(await mkdtemp(join(tmpdir(), "s2j-oss-merge-")), "ACK.md");
    await runGenerate({
      input: join(fixtureDir, "minimal.composer.lock"),
      inputs: [join(fixtureDir, "minimal.composer.lock"), join(fixtureDir, "minimal.package-lock.json")],
      format: "md",
      outFile,
      includeDev: false,
    });
    const md = await readFile(outFile, "utf8");
    expect(md).toContain("psr/log");
    expect(md).toContain("lodash");
  });

  it("includes license text when resolveLicenseText is set", async () => {
    const outFile = join(await mkdtemp(join(tmpdir(), "s2j-oss-lic-")), "ACK.md");
    await runGenerate({
      input: join(fixtureDir, "minimal.composer.lock"),
      format: "md",
      outFile,
      includeDev: false,
      resolveLicenseText: true,
      offline: true,
    });
    const md = await readFile(outFile, "utf8");
    expect(md).toContain("## License texts");
    expect(md).toContain("MIT License");
  });

  it("rejects lockfile with -o directory only", async () => {
    const outDir = await mkdtemp(join(tmpdir(), "s2j-oss-dir-"));
    await expect(
      runGenerate({
        input: join(fixtureDir, "minimal.package-lock.json"),
        format: "md",
        outputDir: outDir,
      }),
    ).rejects.toBeInstanceOf(GenerateError);
  });
});