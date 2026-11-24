import { readFile } from "node:fs/promises";

import { parse as parseYaml } from "yaml";

export type OnotCompanyConfig = {
  organization?: string;
  copyright_holder?: string;
  copyright_year?: number;
  contact_email?: string;
  source_download_url?: string;
};

export type OnotConfig = {
  company?: OnotCompanyConfig;
};

export async function loadOnotConfig(path: string | undefined): Promise<OnotConfig | null> {
  if (!path) {
    return null;
  }

  let text: string;
  try {
    text = await readFile(path, "utf8");
  } catch {
    throw new OnotConfigError(`config could not be read: ${path}`, 4);
  }

  let parsed: unknown;
  try {
    parsed = parseYaml(text);
  } catch {
    throw new OnotConfigError("invalid configuration YAML", 4);
  }

  if (!parsed || typeof parsed !== "object") {
    throw new OnotConfigError("invalid configuration structure", 4);
  }

  return parsed as OnotConfig;
}

export class OnotConfigError extends Error {
  readonly exitCode: number;

  constructor(message: string, exitCode = 4) {
    super(message);
    this.name = "OnotConfigError";
    this.exitCode = exitCode;
  }
}