import { readFile } from "node:fs/promises";

import { rejectDangerousXml } from "../cyclonedx/xml-guard.js";
import type { SbomParseResult } from "../sbom-types.js";
import { loadSpdxJsonFromFile, parseSpdxDocument, SpdxParseError } from "./parse-spdx-json.js";
import { parseSpdxTagValueText } from "./parse-spdx-tagvalue.js";
import { parseSpdxYamlText } from "./parse-spdx-yaml.js";
import { detectSpdxSerialization } from "./serialization.js";
import type { SpdxDocument } from "./types.js";

export async function loadSpdxFromFile(path: string): Promise<SbomParseResult> {
  const data = await readFile(path);
  const text = data.toString("utf8");
  const serialization = detectSpdxSerialization(data, path);

  switch (serialization) {
    case "yaml":
      return parseSpdxYamlText(text);
    case "tagvalue":
      return parseSpdxTagValueText(text);
    case "xml":
      rejectDangerousXml(data);
      throw new SpdxParseError(
        "SPDX RDF/XML is not supported in this build; use JSON, YAML, or Tag-Value",
        2,
      );
    case "json":
      return loadSpdxJsonFromBuffer(text);
    default:
      return loadSpdxJsonFromFile(path).catch(() => {
        if (text.trimStart().startsWith("SPDXVersion:")) {
          return parseSpdxTagValueText(text);
        }
        throw new SpdxParseError(`could not parse SPDX document: ${path}`, 2);
      });
  }
}

function loadSpdxJsonFromBuffer(text: string): SbomParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw new SpdxParseError("input could not be parsed as JSON", 2);
  }
  if (!parsed || typeof parsed !== "object") {
    throw new SpdxParseError("input is not a SPDX JSON document", 2);
  }
  return parseSpdxDocument(parsed as SpdxDocument);
}