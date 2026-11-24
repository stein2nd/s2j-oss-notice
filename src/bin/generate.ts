import { Command, Option } from "commander";
import { stat } from "node:fs/promises";

import { detectInputKind } from "../adapters/detect-input.js";
import { isLockfileKind } from "../adapters/load-lockfile.js";
import { ComposerLockError } from "../adapters/composer/parse-composer-lock.js";
import { PackageLockError } from "../adapters/npm/parse-package-lock.js";
import { PnpmLockError } from "../adapters/pnpm/parse-pnpm-lock.js";
import { YarnLockError } from "../adapters/yarn/parse-yarn-lock.js";
import { OnotConfigError } from "../adapters/onot-config.js";
import { CycloneDxParseError } from "../adapters/cyclonedx/parse-cyclonedx-json.js";
import { SpdxParseError } from "../adapters/spdx/parse-spdx-json.js";
import {
  isBinaryFormat,
  normalizeOnotFormat,
  ONOT_FORMATS,
} from "../compat/onot-formats.js";
import {
  GenerateError,
  LicenseResolveError,
  runGenerate,
  UnknownInputError,
} from "../core/generate.js";
import { summarizeWarnings } from "../compat/warnings.js";

function collectFormat(value: string, previous: string[] = []): string[] {
  return [...previous, value];
}

function collectInput(value: string, previous: string[] = []): string[] {
  return [...previous, value];
}

async function ensureOutputDir(path: string): Promise<void> {
  const dir = await stat(path)
    .then((s) => s.isDirectory())
    .catch(() => false);
  if (!dir) {
    await import("node:fs/promises").then(({ mkdir }) => mkdir(path, { recursive: true }));
  }
}

export async function runGenerateCommand(argv: string[]): Promise<number> {
  const program = new Command();
  program
    .addOption(
      new Option(
        "-i, --input <path>",
        "path to SBOM or lockfile (repeatable for lockfile merge)",
      ).argParser(collectInput),
    )
    .addOption(
      new Option("-f, --format <format>", "output format: html, text, md, pdf (repeatable)").argParser(
        collectFormat,
      ),
    )
    .option("-o, --output-dir <dir>", "directory for OSS_Notice_* files (onot-compatible)")
    .addOption(new Option("--output <dir>", "alias for --output-dir").hideHelp())
    .option("--out-file <path>", "write a single file (L0)")
    .option("--config <path>", "onot.yaml")
    .option("--include-dev", "include dev dependencies (lockfile)")
    .option("--resolve-license-text", "embed resolved license full text (lockfile)")
    .option("--strict", "treat unresolved license text as fatal (exit 3)")
    .option("--offline", "use bundled license data only (default)", true)
    .option("--online", "fetch missing SPDX license text from spdx.org")
    .option("--stdout", "write a single text format to stdout")
    .option("-q, --quiet", "suppress warnings on stderr")
    .option("--json", "write machine-readable report to stdout");

  program.parse(argv, { from: "user" });
  const opts = program.opts<{
    input?: string | string[];
    resolveLicenseText?: boolean;
    format?: string[];
    outputDir?: string;
    output?: string;
    outFile?: string;
    config?: string;
    includeDev?: boolean;
    strict?: boolean;
    online?: boolean;
    stdout?: boolean;
    quiet?: boolean;
    json?: boolean;
  }>();

  const outputDir = opts.outputDir ?? opts.output;

  const inputPaths = opts.input
    ? Array.isArray(opts.input)
      ? opts.input
      : [opts.input]
    : [];

  if (inputPaths.length === 0) {
    console.error("error: --input is required\n");
    return 1;
  }

  if (opts.outFile && outputDir) {
    console.error("error: use either --output-dir or --out-file, not both\n");
    return 1;
  }

  if (!opts.outFile && !outputDir && !opts.stdout) {
    console.error("error: --output-dir, --out-file, or --stdout is required\n");
    return 1;
  }

  if (opts.stdout && opts.json) {
    console.error("error: --stdout and --json both write to stdout\n");
    return 1;
  }

  const formatArgv = (opts.format?.length ?? 0) > 0 ? opts.format! : ["md"];
  const normalizedFormats = formatArgv.map((f) => normalizeOnotFormat(f));
  const unknown = formatArgv.filter((f, i) => normalizedFormats[i] == null);
  if (unknown.length > 0) {
    console.error(
      `error: unknown output format(s): ${unknown.join(", ")}. supported: ${ONOT_FORMATS.join(", ")}\n`,
    );
    return 2;
  }

  const formats = normalizedFormats as Array<"html" | "text" | "md" | "pdf">;

  if (opts.stdout && formats.length !== 1) {
    console.error("error: --stdout requires exactly one --format\n");
    return 1;
  }

  if (opts.stdout && (formats[0] === "html" || isBinaryFormat(formats[0] ?? ""))) {
    console.error("error: html and pdf are not supported with --stdout\n");
    return 1;
  }

  for (const inputPath of inputPaths) {
    const inputKind = await detectInputKind(inputPath);
    if (isLockfileKind(inputKind) && outputDir && !opts.outFile) {
      console.error("error: lockfile input requires --out-file (not --output-dir)\n");
      return 1;
    }
  }

  const offline = opts.online ? false : true;

  if (outputDir) {
    await ensureOutputDir(outputDir);
  }

  try {
    const result = await runGenerate({
      input: inputPaths[0]!,
      inputs: inputPaths.length > 1 ? inputPaths : undefined,
      formats,
      outputDir,
      outFile: opts.outFile,
      configPath: opts.config,
      includeDev: opts.includeDev,
      resolveLicenseText: opts.resolveLicenseText,
      strict: opts.strict,
      offline,
      quiet: opts.quiet,
      stdout: opts.stdout,
      jsonReport: opts.json,
    });

    if (!opts.quiet && !opts.json) {
      for (const warning of result.warnings) {
        console.error(`warning: ${warning}`);
      }
      const summary = summarizeWarnings(result.warnings);
      if (summary) {
        console.error(summary);
      }
    }

    if (opts.stdout && result.content) {
      process.stdout.write(result.content);
      return 0;
    }

    if (opts.json) {
      console.log(
        JSON.stringify(
          {
            product: result.product,
            written: result.written ?? [],
            warnings: result.warnings,
          },
          null,
          2,
        ),
      );
      return 0;
    }

    for (const entry of result.written ?? []) {
      console.log(`wrote ${entry.path}`);
    }

    return 0;
  } catch (err) {
    if (
      err instanceof SpdxParseError ||
      err instanceof CycloneDxParseError ||
      err instanceof OnotConfigError ||
      err instanceof GenerateError ||
      err instanceof UnknownInputError ||
      err instanceof LicenseResolveError ||
      err instanceof ComposerLockError ||
      err instanceof PackageLockError ||
      err instanceof PnpmLockError ||
      err instanceof YarnLockError
    ) {
      console.error(`error: ${err.message}`);
      return err.exitCode;
    }
    console.error(`error: ${err instanceof Error ? err.message : String(err)}`);
    return 1;
  }
}