import YAML from "yaml";

import type { SbomParseResult } from "../sbom-types.js";
import { parseSpdxDocument, SpdxParseError } from "./parse-spdx-json.js";
import type { SpdxDocument } from "./types.js";

export function parseSpdxYamlText(text: string): SbomParseResult {
  let parsed: unknown;
  try {
    parsed = YAML.parse(text);
  } catch {
    throw new SpdxParseError("input could not be parsed as SPDX YAML", 2);
  }

  if (!parsed || typeof parsed !== "object") {
    throw new SpdxParseError("input is not a SPDX YAML document", 2);
  }

  return parseSpdxDocument(parsed as SpdxDocument);
}