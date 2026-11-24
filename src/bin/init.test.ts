import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";

import { runInitCommand } from "./init.js";

describe("runInitCommand (G2)", () => {
  it("writes onot.yaml from template", async () => {
    const dir = await mkdtemp(join(tmpdir(), "s2j-init-"));
    try {
      const code = await runInitCommand(["--cwd", dir]);
      expect(code).toBe(0);

      const dest = join(dir, "onot.yaml");
      await access(dest, constants.R_OK);
      const text = await readFile(dest, "utf8");
      expect(text).toContain("company:");
      expect(text).toContain("organization:");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("skips when file exists without --force", async () => {
    const dir = await mkdtemp(join(tmpdir(), "s2j-init-skip-"));
    try {
      expect(await runInitCommand(["--cwd", dir])).toBe(0);
      expect(await runInitCommand(["--cwd", dir])).toBe(0);
      const text = await readFile(join(dir, "onot.yaml"), "utf8");
      expect(await runInitCommand(["--cwd", dir, "--force"])).toBe(0);
      const after = await readFile(join(dir, "onot.yaml"), "utf8");
      expect(after).toBe(text);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});