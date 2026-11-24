import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { detectInputKind, UnknownInputError } from "../adapters/detect-input.js";
import { isSbomKind, loadSbomFromFile } from "../adapters/load-sbom.js";
import { isLockfileKind, loadLockfilesFromPaths } from "../adapters/load-lockfile.js";
import { loadOnotConfig } from "../adapters/onot-config.js";
import {
  fileExtension,
  normalizeOnotFormat,
  type OnotRenderFormat,
} from "../compat/onot-formats.js";
import { resolveExtractedLicenses } from "../license/resolve-licenses.js";
import { renderAcknowledgementsMarkdown } from "../renderers/acknowledgements-markdown/render.js";
import { outputFilename } from "../renderers/onot-markdown/output-filename.js";
import { buildNoticeDocument } from "./build-notice.js";
import { buildNoticeFromLockfile } from "./build-notice-lockfile.js";
import { exitCodeForLicenseStrict, LicenseResolveError } from "./errors.js";
import { renderOnotFormat } from "./render-onot.js";
import type { GenerateNoticeOptions, GenerateNoticeResult } from "../types/api.js";

function resolveFormats(options: GenerateNoticeOptions): OnotRenderFormat[] {
  if (options.formats && options.formats.length > 0) {
    return options.formats;
  }
  const single = options.format ?? "md";
  const normalized =
    single === "markdown" ? "md" : (normalizeOnotFormat(single) ?? "md");
  return [normalized];
}

function resolveInputPaths(options: GenerateNoticeOptions): string[] {
  if (options.inputs?.length) {
    return options.inputs;
  }
  return [options.input];
}

async function generateFromSbom(
  options: GenerateNoticeOptions,
  formats: OnotRenderFormat[],
  kind: "spdx" | "cyclonedx",
): Promise<GenerateNoticeResult> {
  const sbom = await loadSbomFromFile(options.input, kind);
  const config = await loadOnotConfig(options.configPath);
  const notice = buildNoticeDocument(sbom, config);

  const { extracted, warnings: resolveWarnings } = await resolveExtractedLicenses(
    notice.packages,
    sbom.extractedLicenses,
    { offline: options.offline ?? true },
  );

  const written: Array<{ format: string; path: string }> = [];
  const allWarnings: string[] = [...notice.warnings, ...resolveWarnings];
  let primaryContent: string | undefined;

  const now = new Date();

  for (const format of formats) {
    const rendered = renderOnotFormat(format, notice, extracted);
    allWarnings.push(...rendered.warnings);

    if (options.stdout) {
      if (formats.length !== 1) {
        throw new GenerateError("--stdout requires exactly one --format", 1);
      }
      if (rendered.kind === "binary") {
        throw new GenerateError("--stdout does not support binary output formats", 1);
      }
      primaryContent = rendered.content;
      continue;
    }

    if (options.outFile) {
      if (formats.length !== 1) {
        throw new GenerateError("--out-file supports a single --format", 1);
      }
      if (rendered.kind === "binary") {
        await writeFile(options.outFile, rendered.content);
      } else {
        await writeFile(options.outFile, rendered.content, "utf8");
      }
      written.push({ format, path: options.outFile });
      if (rendered.kind === "text") {
        primaryContent = rendered.content;
      }
      continue;
    }

    const outputDir = options.outputDir!;
    await mkdir(outputDir, { recursive: true });
    const ext = fileExtension(format);
    const fileName = outputFilename(sbom.documentName, ext, now);
    const outputPath = join(outputDir, fileName);
    if (rendered.kind === "binary") {
      await writeFile(outputPath, rendered.content);
    } else {
      await writeFile(outputPath, rendered.content, "utf8");
      if (!primaryContent) {
        primaryContent = rendered.content;
      }
    }
    written.push({ format, path: outputPath });
  }

  const warnings = [...new Set(allWarnings)];
  exitCodeForLicenseStrict(warnings, options.strict ?? false);

  return {
    product: sbom.documentName,
    content: primaryContent,
    outputDir: options.outputDir,
    outputPath: written[0]?.path,
    written,
    warnings,
  };
}

async function generateFromLockfile(options: GenerateNoticeOptions): Promise<GenerateNoticeResult> {
  if (!options.outFile) {
    throw new GenerateError(
      "lockfile input requires --out-file (use -o only for SPDX SBOM / L1)",
      1,
    );
  }

  const inputs = resolveInputPaths(options);
  if (inputs.length === 0) {
    throw new GenerateError("at least one --input is required", 1);
  }

  for (const path of inputs) {
    const kind = await detectInputKind(path);
    if (!isLockfileKind(kind)) {
      throw new GenerateError(`not a lockfile input: ${path}`, 1);
    }
  }

  const devOpts = { dev: options.includeDev ?? false };
  const parsed = await loadLockfilesFromPaths(inputs, devOpts);

  const notice = buildNoticeFromLockfile(parsed);
  let resolveWarnings: string[] = [];
  let extracted = undefined;

  if (options.resolveLicenseText) {
    const resolved = await resolveExtractedLicenses(notice.packages, [], {
      offline: options.offline ?? true,
    });
    extracted = resolved.extracted;
    resolveWarnings = resolved.warnings;
    exitCodeForLicenseStrict(resolveWarnings, options.strict ?? false);
  }

  const content = renderAcknowledgementsMarkdown(notice, { extracted });
  const warnings = [...new Set([...notice.warnings, ...resolveWarnings])];

  await writeFile(options.outFile, content, "utf8");

  return {
    product: parsed.documentName,
    content,
    outputPath: options.outFile,
    written: [{ format: "md", path: options.outFile }],
    warnings,
  };
}

export async function runGenerate(options: GenerateNoticeOptions): Promise<GenerateNoticeResult> {
  const formats = resolveFormats(options);

  if (options.jsonReport && options.stdout) {
    throw new GenerateError("--stdout and --json both write to stdout", 1);
  }

  if (!options.outputDir && !options.outFile && !options.stdout) {
    throw new GenerateError("output directory (-o), --out-file, or --stdout is required", 1);
  }

  const inputs = resolveInputPaths(options);
  const firstKind = await detectInputKind(inputs[0]!);
  if (firstKind === "unknown") {
    throw new UnknownInputError(inputs[0]!);
  }

  if (inputs.length > 1 && isSbomKind(firstKind)) {
    throw new GenerateError("multiple --input is supported for lockfiles only", 1);
  }

  if (isSbomKind(firstKind)) {
    if (inputs.length !== 1) {
      throw new GenerateError("SBOM input accepts a single --input", 1);
    }
    return generateFromSbom({ ...options, input: inputs[0]! }, formats, firstKind);
  }

  if (formats.length !== 1 || formats[0] !== "md") {
    throw new GenerateError("lockfile input supports markdown output only", 1);
  }

  return generateFromLockfile(options);
}

export class GenerateError extends Error {
  readonly exitCode: number;

  constructor(message: string, exitCode = 1) {
    super(message);
    this.name = "GenerateError";
    this.exitCode = exitCode;
  }
}

export { UnknownInputError, LicenseResolveError };