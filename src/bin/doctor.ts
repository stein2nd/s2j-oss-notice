import { access } from "node:fs/promises";
import { constants, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";

import { detectInputKind } from "../adapters/detect-input.js";
import { lookupBundledLicenseText } from "../license/catalog.js";

const require = createRequire(import.meta.url);
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PACKAGE_VERSION =
  (require(join(packageRoot, "package.json")) as { version?: string }).version ?? "unknown";
const MIN_NODE_MAJOR = 22;

type DoctorRow = {
  name: string;
  status: "OK" | "FAIL";
  detail?: string;
};

function nodeMajor(): number {
  const major = Number.parseInt(process.versions.node.split(".")[0] ?? "", 10);
  return Number.isFinite(major) ? major : 0;
}

export async function runDoctorCommand(argv: string[]): Promise<number> {
  const program = new Command();
  program
    .option("-i, --input <path>", "validate input file readability and detectable format")
    .option("--cwd <dir>", "host directory for ack.config.json detection")
    .option("-q, --quiet", "print only failures");

  program.parse(argv, { from: "user" });
  const opts = program.opts<{ input?: string; quiet?: boolean; cwd?: string }>();

  const hostRoot = resolve(opts.cwd ?? process.cwd());
  const rows: DoctorRow[] = [];
  let failed = false;

  const nodeOk = nodeMajor() >= MIN_NODE_MAJOR;
  rows.push({
    name: "Node.js",
    status: nodeOk ? "OK" : "FAIL",
    detail: `${process.versions.node} (requires >= ${MIN_NODE_MAJOR})`,
  });
  if (!nodeOk) {
    failed = true;
  }

  rows.push({
    name: "s2j-oss-notice",
    status: "OK",
    detail: PACKAGE_VERSION,
  });

  const mit = lookupBundledLicenseText("MIT");
  const bundledOk = Boolean(mit?.text?.trim());
  rows.push({
    name: "bundled license catalog",
    status: bundledOk ? "OK" : "FAIL",
    detail: bundledOk ? "MIT entry readable" : "licenses.json missing or empty",
  });
  if (!bundledOk) {
    failed = true;
  }

  const ackConfig = join(hostRoot, "ack.config.json");
  if (existsSync(ackConfig)) {
    rows.push({
      name: "Ack pipeline scope",
      status: "OK",
      detail: "ack.config.json present — run s2j-acknowledgements doctor (Syft/engine not checked here)",
    });
  } else {
    rows.push({
      name: "Ack pipeline scope",
      status: "OK",
      detail: "standalone (no ack.config.json); see docs/decisions/004-doctor-and-init-scope.md",
    });
  }

  if (opts.input) {
    const inputPath = resolve(opts.input);
    try {
      await access(inputPath, constants.R_OK);
      const kind = await detectInputKind(inputPath);
      const kindOk = kind !== "unknown";
      rows.push({
        name: "input",
        status: kindOk ? "OK" : "FAIL",
        detail: kindOk ? `${kind}: ${inputPath}` : `could not detect format: ${inputPath}`,
      });
      if (!kindOk) {
        failed = true;
      }
    } catch {
      rows.push({
        name: "input",
        status: "FAIL",
        detail: `not readable: ${inputPath}`,
      });
      failed = true;
    }
  }

  if (!opts.quiet || failed) {
    console.log("S2J OSS Notice — doctor (standalone scope, G5)\n");
    for (const row of rows) {
      console.log(`[${row.status}] ${row.name}${row.detail ? ` — ${row.detail}` : ""}`);
    }
    console.log(
      "\nPipeline / Syft / Feluda / engine resolution: s2j-acknowledgements doctor (ADR-004).",
    );
  }

  return failed ? 1 : 0;
}