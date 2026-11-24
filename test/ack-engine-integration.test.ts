import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ackRoot = join(fileURLToPath(new URL(".", import.meta.url)), "../../s2j-acknowledgements");
const ackGenerate = join(ackRoot, "src/application/pipeline.ts");

/**
 * Ack パイプラインが `pipeline.engine: "oss-notice"` を解釈する (姉妹リポジトリ E2E の読み取り検証)。
 */
describe("Ack engine integration (sibling repo)", () => {
  it.skipIf(!existsSync(ackGenerate))("ack pipeline sources dispatch oss-notice engine", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile(ackGenerate, "utf8"),
    );
    expect(source).toContain('resolveNoticeEngine');
    expect(source).toContain("runNoticeGenerate");
    expect(source).toContain("oss-notice");
  });
});