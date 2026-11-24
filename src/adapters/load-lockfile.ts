import { detectInputKind, type InputKind } from "./detect-input.js";
import { loadComposerLockFromFile } from "./composer/parse-composer-lock.js";
import type { LockfileParseResult } from "./lockfile-types.js";
import { mergeLockfileResults } from "./merge-lockfiles.js";
import { loadPackageLockFromFile } from "./npm/parse-package-lock.js";
import { loadPnpmLockFromFile } from "./pnpm/parse-pnpm-lock.js";
import { loadYarnLockFromFile } from "./yarn/parse-yarn-lock.js";

export type LockfileKind = Extract<InputKind, "composer" | "npm" | "pnpm" | "yarn">;

export function isLockfileKind(kind: InputKind): kind is LockfileKind {
  return kind === "composer" || kind === "npm" || kind === "pnpm" || kind === "yarn";
}

export async function loadSingleLockfile(
  path: string,
  kind: LockfileKind,
  options: { dev?: boolean },
): Promise<LockfileParseResult> {
  switch (kind) {
    case "composer":
      return loadComposerLockFromFile(path, options);
    case "npm":
      return loadPackageLockFromFile(path, options);
    case "pnpm":
      return loadPnpmLockFromFile(path, options);
    case "yarn":
      return loadYarnLockFromFile(path, options);
  }
}

export async function loadLockfilesFromPaths(
  paths: string[],
  options: { dev?: boolean },
): Promise<LockfileParseResult> {
  const results: LockfileParseResult[] = [];
  for (const path of paths) {
    const kind = await detectInputKind(path);
    if (!isLockfileKind(kind)) {
      throw new Error(`not a lockfile: ${path}`);
    }
    results.push(await loadSingleLockfile(path, kind, options));
  }
  return mergeLockfileResults(results);
}