import { copyFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const TEMPLATE = join(packageRoot, "config", "onot.yaml.example");

export async function runInitCommand(argv: string[]): Promise<number> {
  const program = new Command();
  program
    .option("-f, --force", "overwrite existing onot.yaml")
    .option("-o, --output <path>", "output path", "onot.yaml")
    .option("--cwd <dir>", "host directory", process.cwd());

  program.parse(argv, { from: "user" });
  const opts = program.opts<{ force?: boolean; output?: string; cwd?: string }>();

  const hostRoot = resolve(opts.cwd ?? process.cwd());
  const dest = resolve(hostRoot, opts.output ?? "onot.yaml");

  try {
    await access(TEMPLATE, constants.R_OK);
  } catch {
    console.error(`error: template not found: ${TEMPLATE}`);
    return 2;
  }

  let exists = true;
  try {
    await access(dest, constants.F_OK);
  } catch {
    exists = false;
  }

  if (exists && !opts.force) {
    console.warn(`warn: ${dest} already exists (use --force to overwrite)`);
    return 0;
  }

  await copyFile(TEMPLATE, dest);
  console.log(`wrote ${dest}`);
  console.log(
    "For full Ack host setup (ack.config.json, Syft, presets): s2j-acknowledgements init --preset dir",
  );
  return 0;
}