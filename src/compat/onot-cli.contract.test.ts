import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { runGenerateCommand } from "../bin/generate.js";

const fixtureDir = join(fileURLToPath(new URL(".", import.meta.url)), "../../test/fixtures");

describe("onot CLI contract (L2)", () => {
  it("uses exit 2 for unknown format", async () => {
    const code = await runGenerateCommand([
      "-i",
      join(fixtureDir, "slice-minimal.spdx.json"),
      "-f",
      "docx",
      "-o",
      await mkdtemp(join(tmpdir(), "s2j-out-")),
    ]);
    expect(code).toBe(2);
  });

  it("uses exit 3 under --strict with missing license text", async () => {
    const outDir = await mkdtemp(join(tmpdir(), "s2j-out-"));
    const code = await runGenerateCommand([
      "-i",
      join(fixtureDir, "slice-minimal.spdx.json"),
      "-f",
      "md",
      "-o",
      outDir,
      "--strict",
      "-q",
    ]);
    expect(code).toBe(3);
  });

  it("emits onot-shaped --json on stdout", async () => {
    const outDir = await mkdtemp(join(tmpdir(), "s2j-out-"));
    const logs: string[] = [];
    const orig = console.log;
    console.log = (...args: unknown[]) => {
      logs.push(String(args[0]));
    };
    try {
      const code = await runGenerateCommand([
        "-i",
        join(fixtureDir, "slice-minimal.spdx.json"),
        "-f",
        "md",
        "-o",
        outDir,
        "--json",
        "-q",
      ]);
      expect(code).toBe(0);
      const payload = JSON.parse(logs[0] ?? "{}") as {
        product?: string;
        written?: unknown[];
        warnings?: unknown[];
      };
      expect(payload.product).toBe("SPDX-Tools-v2.0");
      expect(payload.written?.length).toBeGreaterThan(0);
      expect(Array.isArray(payload.warnings)).toBe(true);
    } finally {
      console.log = orig;
    }
  });

  it("accepts explicit -f md for lockfile (L0, no duplicate default)", async () => {
    const outFile = join(await mkdtemp(join(tmpdir(), "s2j-l0-cli-")), "ACK.md");
    const code = await runGenerateCommand([
      "-i",
      join(fixtureDir, "minimal.composer.lock"),
      "-f",
      "md",
      "--out-file",
      outFile,
    ]);
    expect(code).toBe(0);
  });
});