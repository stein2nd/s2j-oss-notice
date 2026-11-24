import { mkdtemp, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { generateNotice } from "../index.js";

const fixtureDir = join(fileURLToPath(new URL(".", import.meta.url)), "../../test/fixtures");

describe("generateNotice (public API)", () => {
  it("supports L2/L3 multi-format and offline like CLI", async () => {
    const outDir = await mkdtemp(join(tmpdir(), "s2j-api-"));
    const result = await generateNotice({
      input: join(fixtureDir, "example.spdx.yaml"),
      formats: ["md", "text"],
      outputDir: outDir,
      configPath: join(fixtureDir, "onot.yaml"),
      offline: true,
    });

    expect(result.product).toBe("example-product");
    expect(result.written).toHaveLength(2);
    expect(result.warnings).toBeInstanceOf(Array);

    const textPath = result.written?.find((entry) => entry.format === "text")?.path;
    expect(textPath).toBeDefined();
    const text = await readFile(textPath!, "utf8");
    expect(text).toContain("Offer of Source Code");
  });

  it("exposes L0 lockfile options on the same entrypoint", async () => {
    const outFile = join(await mkdtemp(join(tmpdir(), "s2j-api-l0-")), "ACK.md");
    const result = await generateNotice({
      input: join(fixtureDir, "minimal.yarn.lock"),
      format: "markdown",
      outFile,
      resolveLicenseText: true,
      offline: true,
    });

    expect(result.written?.[0]?.path).toBe(outFile);
    const md = await readFile(outFile, "utf8");
    expect(md).toContain("left-pad");
    expect(md).toContain("## License texts");
  });
});