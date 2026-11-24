# S2J OSS Notice — TypeScript API

## 方針 `{@api:s-h001}`

* **CLI と同一コア:** `generateNotice()` は `runGenerate()` のエイリアスです。L1– L3のオプションは [cli.md](./cli.md) と同じ意味です。
* 型の正本は `src/types/api.ts` です。ビルド後は `dist/index.d.ts` から参照します。

## エントリーポイント `{@api:s-h002}`

```ts
import {
  generateNotice,
  GenerateError,
  LicenseResolveError,
  UnknownInputError,
} from "@s2j/oss-notice";
import type {
  GenerateNoticeOptions,
  GenerateNoticeResult,
  NoticeDocument,
  PackageRecord,
} from "@s2j/oss-notice";
```

## `GenerateNoticeOptions` `{@api:s-h003}`

### 共通 `{@api:s-h004}`

| フィールド | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `input` | `string` | (必須) | SBOM または lockfile パス |
| `inputs` | `string[]?` | — | **L0:** 追加 lockfile (マージ)。CLI の `-i` 反復と同等 |
| `format` | `NoticeFormat?` | `"md"` | 単一出力。`markdown` は `md` のエイリアス |
| `formats` | `OnotRenderFormat[]?` | — | 複数出力 (`html` \| `text` \| `md` \| `pdf`)。`format` より優先 |
| `configPath` | `string?` | — | **L1:** `onot.yaml` |
| `strict` | `boolean?` | `false` | **L2:** 未解決ライセンスで `LicenseResolveError` (exit3相当) |
| `offline` | `boolean?` | `true` | **L3:** bundled `licenses.json` のみ。`false` で spdx.org 取得。CLI `--online` と同等 |
| `quiet` | `boolean?` | — | CLI 向け。API では警告配列は常に返る |
| `stdout` | `boolean?` | — | 単一テキスト形式をファイルに書かず `content` に返す |
| `jsonReport` | `boolean?` | — | CLI `--json` 向け |

### L1 (SBOM → onot 出力) `{@api:s-l1-sbom-onot}`

`outputDir` と SPDX / CycloneDX 入力を組み合わせます。`-o` と同等です。

| フィールド | 説明 |
| --- | --- |
| `outputDir` | `OSS_Notice_*.{md,html,txt,pdf}` を書き込むディレクトリ |
| `outFile` | 代替: 単一ファイル出力 (1形式のみ) |

いずれか一方、`stdout`、または `jsonReport` 経路が必要です。

```ts
const result = await generateNotice({
  input: "./sbom.spdx.json",
  formats: ["md", "pdf"],
  outputDir: "./build/oss-notice/onot-notice",
  configPath: "./onot.yaml",
  offline: true,
});
```

### L0 (lockfile → Acknowledgements) `{@api:s-l0-lockfile-acknowledgements}`

`--out-file` と同等。**`outputDir` は不可。**

| フィールド | 説明 |
| --- | --- |
| `outFile` | 単一 Markdown 出力パス |
| `includeDev` | dev 依存を含める (デフォルト `false`) |
| `resolveLicenseText` | `## License texts` に全文を付与。CLI `--resolve-license-text` と同等 |

```ts
const result = await generateNotice({
  input: "./composer.lock",
  inputs: ["./package-lock.json"],
  format: "markdown",
  outFile: "./ACKNOWLEDGEMENTS.md",
  includeDev: false,
  resolveLicenseText: true,
  offline: true,
});
```

lockfile 入力では `format` / `formats` は **`md` のみ** です。

## `GenerateNoticeResult` `{@api:s-h004-2}`

```ts
type GenerateNoticeResult = {
  product?: string;
  content?: string;
  outputPath?: string;
  outputDir?: string;
  written?: Array<{ format: string; path: string }>;
  warnings: string[];
};
```

| フィールド | 説明 |
| --- | --- |
| `product` | SBOM / lock の文書名 |
| `content` | 主成果物のテキスト (`stdout` または最初のテキスト出力) |
| `outputPath` | 先頭の書き込み先 |
| `written` | CLI `--json` と同型の一覧。L2向け |
| `warnings` | **常に配列**(空可)。onot の stderr `warning:` に相当 |

## エラー `{@api:s-h005}`

| クラス | 用途 | `exitCode` |
| --- | --- | --- |
| `UnknownInputError` | 入力の形式不明 | `2` |
| `GenerateError` | 用法エラー・出力競合 | `1` |
| `LicenseResolveError` | `--strict` 時の未解決ライセンス | `3` |

パースエラーはアダプタ別 (`SpdxParseError` 等)。CLI 経路では exit にマッピングされます。

## 実装状態 `{@api:s-h006}`

* `src/index.ts` は **実装済み**(`generateNotice` = `runGenerate`)。
* 契約テスト: `src/core/generate.test.ts` (L1)、`generate-cyclonedx.test.ts` (L3)、`generate-lockfile.test.ts` (L0)、`src/core/generate-api.test.ts`(公開 import)。
* 実装状況の索引: [status.md](./status.md) § TypeScript API。