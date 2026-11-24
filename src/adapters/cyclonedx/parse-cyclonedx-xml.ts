import { readFile } from "node:fs/promises";
import { XMLParser } from "fast-xml-parser";

import type { SbomParseResult } from "../sbom-types.js";
import type { CycloneDxComponent, CycloneDxLicense } from "./types.js";
import { CycloneDxParseError } from "./parse-cyclonedx-json.js";
import { parseCycloneDxDocument } from "./parse-cyclonedx-json.js";
import { rejectDangerousXml } from "./xml-guard.js";

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value == null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function mapXmlLicense(entry: Record<string, unknown>): CycloneDxLicense | null {
  const id = typeof entry.id === "string" ? entry.id : undefined;
  const name = typeof entry.name === "string" ? entry.name : undefined;
  const textNode = entry.text as { content?: string } | string | undefined;
  const content =
    typeof textNode === "string"
      ? textNode
      : typeof textNode?.content === "string"
        ? textNode.content
        : undefined;
  if (!id && !name) {
    return null;
  }
  return {
    id,
    name,
    text: content != null ? { content } : undefined,
  };
}

function mapXmlComponent(raw: Record<string, unknown>): CycloneDxComponent {
  const licensesNode = raw.licenses as Record<string, unknown> | undefined;
  const licenses: CycloneDxComponent["licenses"] = [];
  if (licensesNode) {
    const expression = licensesNode.expression;
    if (typeof expression === "string" && expression.trim()) {
      licenses.push({ expression: expression.trim() });
    }
    for (const lic of asArray(licensesNode.license as Record<string, unknown> | Record<string, unknown>[])) {
      const mapped = mapXmlLicense(lic);
      if (mapped) {
        licenses.push({ license: mapped });
      }
    }
  }

  return {
    name: typeof raw.name === "string" ? raw.name : undefined,
    version: typeof raw.version === "string" ? raw.version : undefined,
    purl: typeof raw.purl === "string" ? raw.purl : undefined,
    copyright: typeof raw.copyright === "string" ? raw.copyright : undefined,
    licenses: licenses.length > 0 ? licenses : undefined,
  };
}

export function parseCycloneDxXmlBuffer(data: Buffer): SbomParseResult {
  rejectDangerousXml(data);

  const parser = new XMLParser({
    ignoreAttributes: true,
    removeNSPrefix: true,
    trimValues: true,
  });

  let root: unknown;
  try {
    root = parser.parse(data.toString("utf8"));
  } catch {
    throw new CycloneDxParseError("input could not be parsed as CycloneDX XML");
  }

  const bom = (root as { bom?: Record<string, unknown> })?.bom;
  if (!bom) {
    throw new CycloneDxParseError("input is not a CycloneDX XML document");
  }

  const metadata = bom.metadata as Record<string, unknown> | undefined;
  const metaComponent = metadata?.component as Record<string, unknown> | undefined;
  const componentsRaw = asArray(
    (bom.components as { component?: unknown } | undefined)?.component ??
      bom.component ??
      (bom.components as unknown),
  ) as Record<string, unknown>[];

  const components = componentsRaw.map((entry) => mapXmlComponent(entry));

  return parseCycloneDxDocument({
    bomFormat: "CycloneDX",
    metadata: metaComponent
      ? {
          component: {
            name: typeof metaComponent.name === "string" ? metaComponent.name : undefined,
            version: typeof metaComponent.version === "string" ? metaComponent.version : undefined,
          },
        }
      : undefined,
    components,
  });
}

export async function loadCycloneDxXmlFromFile(path: string): Promise<SbomParseResult> {
  const data = await readFile(path);
  return parseCycloneDxXmlBuffer(data);
}