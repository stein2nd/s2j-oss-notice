import { basename } from "node:path";

export type SpdxSerialization = "json" | "yaml" | "tagvalue" | "xml" | "";

export function detectSpdxSerialization(data: Buffer, path: string): SpdxSerialization {
  const head = data.subarray(0, 8192);
  const stripped = head.toString("utf8").trimStart();
  const lowered = head.toString("latin1").toLowerCase();

  if (stripped.startsWith("<") || lowered.includes("<rdf:rdf") || lowered.includes("spdx.org/rdf")) {
    return "xml";
  }
  if (stripped.startsWith("{") || lowered.includes('"spdxversion"')) {
    return "json";
  }
  if (stripped.startsWith("SPDXVersion:") || head.includes("\nSPDXVersion:")) {
    return "tagvalue";
  }
  if (lowered.includes("spdxversion:")) {
    return "yaml";
  }

  const base = basename(path).toLowerCase();
  if (base.endsWith(".yaml") || base.endsWith(".yml")) {
    return "yaml";
  }
  if (base.endsWith(".spdx") || base.endsWith(".tag")) {
    return "tagvalue";
  }
  if (base.endsWith(".rdf") || base.endsWith(".rdf.xml")) {
    return "xml";
  }

  return "";
}