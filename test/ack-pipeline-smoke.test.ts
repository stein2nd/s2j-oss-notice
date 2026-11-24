import { mkdtemp, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { runGenerateCommand } from "../src/bin/generate.js";

const fixtureDir = join(fileURLToPath(new URL(".", import.meta.url)), "fixtures");

/**
 * Ack が起動する argv のスモーク ([pipeline-integration.md](../docs/pipeline-integration.md)).
 */
describe("Ack pipeline smoke (L1)", () => {
  it("runs generate -i sbom -f md -o dir --config onot.yaml", async () => {
    const workDir = await mkdtemp(join(tmpdir(), "s2j-ack-work-"));
    const noticeDir = join(workDir, "onot-notice");
    const code = await runGenerateCommand([
      "-i",
      join(fixtureDir, "slice.spdx.json"),
      "-f",
      "md",
      "--config",
      join(fixtureDir, "onot.yaml"),
      "-o",
      noticeDir,
      "-q",
    ]);
    expect(code).toBe(0);

    const files = await readdir(noticeDir);
    const md = files.find((f) => f.startsWith("OSS_Notice_") && f.endsWith(".md"));
    expect(md).toBeDefined();
    const body = await readFile(join(noticeDir, md!), "utf8");
    expect(body).toContain("# OSS Notice for SPDX-Tools-v2.0");
    expect(body).toContain("## Components");
    expect(body).toContain("## Licenses");
  });
});