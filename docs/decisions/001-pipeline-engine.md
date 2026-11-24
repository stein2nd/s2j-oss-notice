# ADR-001: `pipeline.engine` の値 (D-007)

**状態:** 採用  
**日付:** 2026-11-25

## 決定 `{@001-pipeline-engine:s-h001}`

`@s2j/acknowledgements` の `ack.config.json` における Notice エンジンは、次の列挙とします。

| 値 | 意味 |
| --- | --- |
| `"onot"` | 現行どおり `{venv}/bin/onot` (または PATH) |
| `"oss-notice"` | `s2j-oss-notice` を onot 互換 argv で起動 |

* **`builtin` は採用しない** (非推奨エイリアスも設けない)。
* 正本: [pipeline-integration.md](../pipeline-integration.md)。姉妹 [pipeline.md](https://github.com/stein2nd/s2j-acknowledgements/blob/main/docs/pipeline.md) は本 ADR に追随する。

## 理由 `{@001-pipeline-engine:s-h002}`

* エンジン名と npm パッケージ (`@s2j/oss-notice`) が対応し、実装時の迷いが少ない。
* 既存 Ack 草案の `builtin` 予約と衝突するため、本 initiative では **明示名** に統一する。
