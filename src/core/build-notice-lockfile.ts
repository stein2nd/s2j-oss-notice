import type { PackageRecord } from "../types/notice.js";
import type { NoticeDocument } from "../types/notice.js";
import { normalizePackages } from "./normalizer.js";

type LockfileParse = {
  packages: PackageRecord[];
  warnings: string[];
};

export function buildNoticeFromLockfile(parse: LockfileParse): NoticeDocument {
  return {
    title: "Open Source Acknowledgements",
    generatedAt: new Date().toISOString(),
    packages: normalizePackages(parse.packages),
    warnings: [...parse.warnings],
  };
}