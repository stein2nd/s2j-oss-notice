import { normalizePackages } from "../core/normalizer.js";
import type { LockfileParseResult } from "./lockfile-types.js";

export function mergeLockfileResults(results: LockfileParseResult[]): LockfileParseResult {
  if (results.length === 0) {
    return { documentName: "project", packages: [], warnings: [] };
  }

  const packages = normalizePackages(results.flatMap((result) => result.packages));
  const warnings = results.flatMap((result) => result.warnings);
  const documentName =
    results.length === 1
      ? results[0]!.documentName
      : results.map((result) => result.documentName).join("+");

  return { documentName, packages, warnings };
}