# S2J OSS Notice — onot 置き換え

## 置き換えレベル `{@onot-parity:s-h001}`

| レベル | 名称 | 完了条件 |
| --- | --- | --- |
| **L1** | Ack backend | `generate -i sbom -f md -o <dir> --config onot.yaml` → `OSS_Notice_*.md` |
| **L2** | onot CLI 互換 | 主要フラグ、`exit code`、stderr 警告 |
| **L3** | 入出力パリティ | SPDX 方言拡張、CycloneDX、PDF、`--online` |
| **L0** | lockfile 直通 | **L1完了後に拡張**。onot 互換外 |

**ゴール:** L3。**実装順:** **L1→ L0拡張 → L2→ L3** (L0は並行ではなく後追い)。

## 機能対応表 `{@onot-parity:s-h002}`

onot README 基準です。✓ は L3目標です。

| 領域 | onot | 本ツール | レベル |
| --- | --- | --- | --- |
| 入力 | SPDX2.x JSON ほか | まず **SPDX JSON** | L1→ L3 |
| 入力 | CycloneDX | 対応予定 | L3 |
| 入力 | lockfile | L0追加経路 | L0 |
| 出力 | Markdown | `OSS_Notice_*.md` | L1 |
| 出力 | HTML / Text / PDF | 対応予定 | L2/L3 |
| 設定 | `onot.yaml` | 読み取り互換 | L1 |
| exit code | 0–4 | 同一意味 ([cli.md](./cli.md)) | L2 |
| UI / sidecar | あり | **非対象** | — |

## 成果物互換 (Markdown) `{@onot-parity:s-h003}`

* **ファイル名:** `OSS_Notice_*.md` (`findOnotMarkdown` と同規則)。
* **構造:** upstream `tests/golden/slice_notice.md` を正本 (D-001)。
* **見出し:** `OSS Notice for …` — SPDX 名前 / `onot.yaml` / Ack `noticeProductName`。

## 検証 `{@onot-parity:s-h004}`

ビット一致は不要。**意味的同等** を目標。

| 手法 | 内容 |
| --- | --- |
| ゴールデン比較 | 固定 SBOM + `onot.yaml`。比較前に構造を正規化 |
| 契約テスト | L2: onot と同一 argv |
| Ack E2E | `pipeline.engine: "oss-notice"` ([001-pipeline-engine.md](./decisions/001-pipeline-engine.md)) |
| onot ピン | [test/onot-version.txt](../test/onot-version.txt) |
