import { readFile } from "node:fs/promises";
import { extname } from "node:path";

import type { SbomParseResult } from "../sbom-types.js";
import { loadCycloneDxJsonFromFile } from "./parse-cyclonedx-json.js";
import { parseCycloneDxXmlBuffer } from "./parse-cyclonedx-xml.js";

function isXmlPayload(data: Buffer, path: string): boolean {
  const ext = extname(path).toLowerCase();
  if (ext === ".xml" || /\.cdx\.xml$/i.test(path)) {
    return true;
  }
  const head = data.subarray(0, 256).toString("utf8").trimStart();
  return head.startsWith("<");
}

export async function loadCycloneDxFromFile(path: string): Promise<SbomParseResult> {
  const data = await readFile(path);
  if (isXmlPayload(data, path)) {
    return parseCycloneDxXmlBuffer(data);
  }
  return loadCycloneDxJsonFromFile(path);
}