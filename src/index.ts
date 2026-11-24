export type { NoticeDocument, PackageRecord } from "./types/notice.js";
export type {
  GenerateNoticeOptions,
  GenerateNoticeResult,
  NoticeFormat,
} from "./types/api.js";

export { runGenerate as generateNotice } from "./core/generate.js";
export {
  GenerateError,
  LicenseResolveError,
  UnknownInputError,
} from "./core/generate.js";