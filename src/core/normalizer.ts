import type { PackageRecord } from "../types/notice.js";

function recordKey(pkg: PackageRecord): string {
  return `${pkg.ecosystem}\0${pkg.name}\0${pkg.version}`;
}

export function normalizePackages(packages: PackageRecord[]): PackageRecord[] {
  const seen = new Map<string, PackageRecord>();

  for (const pkg of packages) {
    seen.set(recordKey(pkg), pkg);
  }

  return [...seen.values()].sort((a, b) => {
    const byName = a.name.localeCompare(b.name, "en", { sensitivity: "base" });
    if (byName !== 0) {
      return byName;
    }
    return a.version.localeCompare(b.version, "en", { sensitivity: "base" });
  });
}