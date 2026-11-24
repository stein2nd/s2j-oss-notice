import type { PackageRecord } from "../types/notice.js";

export type LockfileParseResult = {
  documentName: string;
  packages: PackageRecord[];
  warnings: string[];
};