import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const specsPath = join(root, "docs/specs.md");
const ackPipeline = join(root, "../s2j-acknowledgements/docs/pipeline.md");

function extractMigrationChecklist(markdown: string): string {
  const start = markdown.indexOf("### 移行チェックリスト");
  const end = markdown.indexOf("## 改訂履歴");
  if (start < 0 || end < 0) {
    throw new Error("specs.md migration checklist boundaries not found");
  }
  return markdown.slice(start, end);
}

describe("specs.md migration checklist (s-h006)", () => {
  it("has no open items", () => {
    const text = readFileSync(specsPath, "utf8");
    const section = extractMigrationChecklist(text);
    const open = section.match(/^\* \[ \]/gm) ?? [];
    expect(open).toEqual([]);
    const done = section.match(/^\* \[x\]/gm) ?? [];
    expect(done.length).toBeGreaterThanOrEqual(6);
  });

  it.skipIf(!existsSync(ackPipeline))(
    "sibling pipeline.md documents pipeline.engine oss-notice",
    () => {
      const pipeline = readFileSync(ackPipeline, "utf8");
      expect(pipeline).toContain("## Notice エンジン");
      expect(pipeline).toContain("`pipeline.engine`");
      expect(pipeline).toContain("`oss-notice`");
      expect(pipeline).toContain("s2j-oss-notice generate");
    },
  );
});