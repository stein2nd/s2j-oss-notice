# S2J OSS Notice — 機能優先度

**実装順:** L1 (P0) → L0拡張 (P1) → L2→ L3。

| 優先度 | 機能 | レベル |
| --- | --- | --- |
| **P0** | SPDX JSON、`onot.yaml`、`-f md`、`-o <dir>` | L1 |
| **P0** | `pipeline.engine: "oss-notice"` 統合 | L1 |
| **P0** | オフライン license 全文 (SPDX 入力) | L1 |
| **P1** | Composer / npm lock、`--out-file` | L0 |
| **P1** | exit code、`--json` / `-q` | L2 |
| **P1** | HTML / Text | L2/L3 |
| **P1** | 本 CLI `doctor` (スタンドアローン) | — |
| **P2** | CycloneDX、SPDX 方言、PDF、`--online` | L3 |
| **P2** | pnpm / yarn、複数 lock マージ | L0 |
