import type { SbomParseResult } from "../sbom-types.js";
import { parseSpdxDocument, SpdxParseError } from "./parse-spdx-json.js";
import type { SpdxDocument, SpdxExtractedLicensingInfo, SpdxPackage } from "./types.js";

const PACKAGE_TAGS = new Set([
  "PackageName",
  "PackageVersion",
  "PackageLicenseConcluded",
  "PackageLicenseDeclared",
  "PackageCopyrightText",
  "PackageDownloadLocation",
  "PackageHomePage",
  "PackageDescription",
]);

function applyTag(
  tag: string,
  value: string,
  doc: { name?: string },
  pkg: SpdxPackage | null,
  extracted: SpdxExtractedLicensingInfo | null,
  extractedList: SpdxExtractedLicensingInfo[],
): { pkg: SpdxPackage | null; extracted: SpdxExtractedLicensingInfo | null } {
  if (tag === "DocumentName") {
    doc.name = value;
    return { pkg, extracted };
  }
  if (tag === "PackageName") {
    const next: SpdxPackage = { name: value };
    return { pkg: next, extracted };
  }
  if (!pkg) {
    return { pkg, extracted };
  }
  switch (tag) {
    case "PackageVersion":
      pkg.versionInfo = value;
      break;
    case "PackageLicenseConcluded":
      pkg.licenseConcluded = value;
      break;
    case "PackageLicenseDeclared":
      pkg.licenseDeclared = value;
      break;
    case "PackageCopyrightText":
      pkg.copyrightText = value;
      break;
    case "PackageDownloadLocation":
      pkg.downloadLocation = value;
      break;
    case "PackageHomePage":
      pkg.homepage = value;
      break;
    case "PackageDescription":
      pkg.description = value;
      break;
    case "LicenseID":
      if (extracted) {
        extractedList.push(extracted);
      }
      return { pkg, extracted: { licenseId: value } };
    case "ExtractedText":
      if (extracted) {
        extracted.extractText = value;
      }
      break;
    case "LicenseName":
      if (extracted) {
        extracted.name = value;
      }
      break;
    default:
      break;
  }
  return { pkg, extracted };
}

export function parseSpdxTagValueText(text: string): SbomParseResult {
  const packages: SpdxPackage[] = [];
  const extractedList: SpdxExtractedLicensingInfo[] = [];
  const doc: { name?: string } = {};
  let pkg: SpdxPackage | null = null;
  let extracted: SpdxExtractedLicensingInfo | null = null;
  let pendingTag: string | null = null;
  let multiline = "";

  const flushMultiline = (): void => {
    if (!pendingTag) {
      return;
    }
    const value = multiline.trimEnd();
    ({ pkg, extracted } = applyTag(pendingTag, value, doc, pkg, extracted, extractedList));
    pendingTag = null;
    multiline = "";
  };

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (line.startsWith("<text>") || line === "<text>") {
      pendingTag = "ExtractedText";
      multiline = line.replace(/^<text>/, "").trimStart();
      continue;
    }
    if (line === "</text>") {
      flushMultiline();
      continue;
    }
    if (pendingTag === "ExtractedText") {
      multiline += `${line}\n`;
      continue;
    }

    const idx = line.indexOf(":");
    if (idx < 0) {
      continue;
    }
    const tag = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();

    if (tag === "PackageName" && pkg) {
      packages.push(pkg);
      if (extracted) {
        extractedList.push(extracted);
        extracted = null;
      }
    }

    if (PACKAGE_TAGS.has(tag) || tag === "DocumentName" || tag.startsWith("Package")) {
      ({ pkg, extracted } = applyTag(tag, value, doc, pkg, extracted, extractedList));
    }
  }

  flushMultiline();
  if (pkg) {
    packages.push(pkg);
  }
  if (extracted) {
    extractedList.push(extracted);
  }

  if (packages.length === 0 && !doc.name) {
    throw new SpdxParseError("input is not a SPDX Tag-Value document", 2);
  }

  const document: SpdxDocument = {
    spdxVersion: "SPDX-2.3",
    name: doc.name,
    packages,
    hasExtractedLicensingInfos: extractedList.length > 0 ? extractedList : undefined,
  };

  return parseSpdxDocument(document);
}