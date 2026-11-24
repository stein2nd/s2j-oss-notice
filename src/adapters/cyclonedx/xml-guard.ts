import { CycloneDxParseError } from "./parse-cyclonedx-json.js";

const DOCTYPE = /<!DOCTYPE/i;
const ENTITY = /<!ENTITY/i;

function candidates(data: Buffer): Buffer[] {
  const withoutNulls = Buffer.from(data.filter((byte) => byte !== 0));
  const blobs = [data, withoutNulls];
  for (const encoding of ["utf-8", "utf-16le", "utf-16be"] as const) {
    try {
      const decoded = new TextDecoder(encoding).decode(data);
      blobs.push(Buffer.from(decoded, "utf8"));
    } catch {
      /* skip invalid encoding */
    }
  }
  return blobs;
}

export function rejectDangerousXml(data: Buffer): void {
  for (const blob of candidates(data)) {
    const text = blob.toString("latin1");
    if (DOCTYPE.test(text) || ENTITY.test(text)) {
      throw new CycloneDxParseError("XML DTD/ENTITY declarations are not allowed (XXE protection)");
    }
  }
}