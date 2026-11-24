import type { InputKind } from "./detect-input.js";
import { loadCycloneDxFromFile } from "./cyclonedx/load-cyclonedx.js";
import { loadSpdxFromFile } from "./spdx/load-spdx.js";
import type { SbomParseResult } from "./sbom-types.js";

export async function loadSbomFromFile(path: string, kind: "spdx" | "cyclonedx"): Promise<SbomParseResult> {
  if (kind === "cyclonedx") {
    return loadCycloneDxFromFile(path);
  }
  return loadSpdxFromFile(path);
}

export function isSbomKind(kind: InputKind): kind is "spdx" | "cyclonedx" {
  return kind === "spdx" || kind === "cyclonedx";
}