import type { OnotOutputFormat, OnotRenderFormat } from "../compat/onot-formats.js";

export type NoticeFormat = OnotOutputFormat | "markdown";

export type GenerateNoticeOptions = {
  input: string;
  /** Additional lockfiles to merge (L0). */
  inputs?: string[];
  /** Single format (API). Use `formats` for multiple (CLI). */
  format?: NoticeFormat;
  formats?: OnotRenderFormat[];
  outFile?: string;
  outputDir?: string;
  configPath?: string;
  includeDev?: boolean;
  /** Resolve bundled (or online) license full text in lockfile output (L0). */
  resolveLicenseText?: boolean;
  strict?: boolean;
  /** Default true (onot offline). Set false when `--online` is passed. */
  offline?: boolean;
  jsonReport?: boolean;
  quiet?: boolean;
  stdout?: boolean;
};

export type GenerateNoticeResult = {
  product?: string;
  content?: string;
  outputPath?: string;
  outputDir?: string;
  written?: Array<{ format: string; path: string }>;
  warnings: string[];
};