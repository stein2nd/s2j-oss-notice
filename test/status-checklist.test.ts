import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const statusPath = join(fileURLToPath(new URL(".", import.meta.url)), "../docs/status.md");

function extractChecklistSection(markdown: string): string {
  const start = markdown.indexOf("## 100% 完了条件チェックリスト");
  const end = markdown.indexOf("## ゲート外・任意");
  if (start < 0 || end < 0) {
    throw new Error("status.md checklist boundaries not found");
  }
  return markdown.slice(start, end);
}

describe("docs/status.md 100% checklist", () => {
  it("has no open items and product goal is 100%", () => {
    const text = readFileSync(statusPath, "utf8");
    const section = extractChecklistSection(text);

    const done = section.match(/^\* \[x\]/gm) ?? [];
    const open = section.match(/^\* \[ \]/gm) ?? [];

    expect(open.length).toBe(0);
    expect(done.length).toBeGreaterThan(0);

    const goal = text.match(
      /\*\*プロダクトゴール \(L3\):\*\* チェックリスト \*\*(\d+)項目中(\d+)項目\*\* = \*\*(\d+)%\*\*/,
    );
    expect(goal).not.toBeNull();

    const total = Number(goal![1]);
    const complete = Number(goal![2]);
    const percent = Number(goal![3]);

    expect(complete).toBe(done.length);
    expect(total).toBe(done.length);
    expect(percent).toBe(100);
  });
});