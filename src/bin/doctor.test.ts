import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";

import { runDoctorCommand } from "./doctor.js";

const fixtureDir = join(fileURLToPath(new URL(".", import.meta.url)), "../../test/fixtures");

describe("runDoctorCommand", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes without input and reports G5 scope", async () => {
    const logs: string[] = [];
    vi.spyOn(console, "log").mockImplementation((msg?: unknown) => {
      logs.push(String(msg ?? ""));
    });
    const code = await runDoctorCommand([]);
    expect(code).toBe(0);
    expect(logs.join("\n")).toContain("Ack pipeline scope");
    expect(logs.join("\n")).toContain("s2j-acknowledgements doctor");
  });

  it("validates SPDX input path", async () => {
    const code = await runDoctorCommand([
      "--input",
      join(fixtureDir, "slice-minimal.spdx.json"),
    ]);
    expect(code).toBe(0);
  });

  it("fails for missing input path", async () => {
    const code = await runDoctorCommand(["--input", join(fixtureDir, "no-such-file.spdx.json")]);
    expect(code).toBe(1);
  });
});