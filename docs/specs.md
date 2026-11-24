# S2J OSS Notice — SPECS

**仕様版:** 1.0.0-spec  
**正本:** `docs/` (本ディレクトリ)  
**スナップショット:** [docs_mod/SPEC.md](../docs_mod/SPEC.md) (草案0.2、2026-11-25凍結)

TypeScript 製 **`@s2j/oss-notice`** (`s2j-oss-notice` CLI) の索引です。[onot](https://github.com/sktelecom/onot) を **置き換え可能な OSS Notice エンジン** とする **設計上の目標** に、onot CLI 契約 (入力 SBOM、設定 YAML、出力 Notice、終了コード) を段階的に整合させます。

**v1の実装順序:** **L1** (Ack パイプライン backend) を完了してから **L0** (lockfile 直通) を拡張する。L0は onot 互換の要件を満たさない。

**リリース語彙:** **npm v1.0.0** = 置き換えレベル **L1完了** (SPDX JSON → `OSS_Notice_*.md`、Ack `pipeline.engine: "oss-notice"` で差し替え可能)。**npm v2.0.0** = **L0単体製品** (lockfile → `--out-file`、Syft / Ack 不要。[l0-standalone.md](./l0-standalone.md)、[ADR-005](./decisions/005-npm-release-l0-standalone.md))。**v2tag は v1公開後。**

## シリーズ位置付け `{@specs:s-h001}`

| 項目 | 内容 |
| --- | --- |
| シリーズ | S2J (Stein2nd Japan tooling) |
| 本プロジェクト | S2J OSS Notice |
| npm パッケージ | `@s2j/oss-notice` |
| CLI コマンド | `s2j-oss-notice` |
| ライセンス | GPL-3.0-or-later |
| Runtime | Node.js **22+** |
| 姉妹 | [`@s2j/acknowledgements`](https://github.com/stein2nd/s2j-acknowledgements)、[`@s2j/docs-linter`](https://github.com/stein2nd/docs-linter) |
| 中間成果物 | **OSS Notice** (`OSS_Notice_*.md` 等) |
| ホスト最終成果物 | **Acknowledgements** (デフォルト `ACKNOWLEDGEMENTS.md`。Ack CLI が Notice を無加工コピー) |

## 仕様正本マトリックス `{@specs:s-h002}`

矛盾時は「正本」を更新し、他ファイルは追随します。[decisions/003-canonical-sources.md](./decisions/003-canonical-sources.md)

| トピック | 正本 |
| --- | --- |
| 用語、ドメイン、非目的 | [domain.md](./domain.md) |
| パイプライン、データモデル、ライセンス全文 | [architecture.md](./architecture.md) |
| CLI、exit code、フォーマット | [cli.md](./cli.md) |
| TypeScript API | [api.md](./api.md) |
| onot 置き換え L0– L3、検証 | [onot-parity.md](./onot-parity.md) |
| Ack 連携、`pipeline.engine` | [pipeline-integration.md](./pipeline-integration.md) |
| 機能優先度 | [priorities.md](./priorities.md) |
| onot / 第三者ライセンス | [license-onot.md](./license-onot.md) |
| 実装 vs 仕様 | [status.md](./status.md) |
| L0単体ホスト (G4) | [l0-standalone.md](./l0-standalone.md) |
| npm semver (v1 / v2) | [decisions/005-npm-release-l0-standalone.md](./decisions/005-npm-release-l0-standalone.md) |
| ADR | [decisions/](./decisions/) |

## 仕様書一覧 `{@specs:s-h003}`

| ファイル | 概要 |
| --- | --- |
| [domain.md](./domain.md) | 用語、目的・非目的、関連プロダクト |
| [architecture.md](./architecture.md) | 設計方針、パイプライン、データモデル、リポジトリ構成、実装ガイド |
| [cli.md](./cli.md) | `generate` (onot 互換 / ネイティブ)、exit code、`doctor` |
| [api.md](./api.md) | `generateNotice()`。L1は CLI 契約が正本 |
| [onot-parity.md](./onot-parity.md) | 置き換えレベル、機能対応表、成果物互換、テスト |
| [pipeline-integration.md](./pipeline-integration.md) | `@s2j/acknowledgements` との統合 |
| [priorities.md](./priorities.md) | P0– P2と L0– L3 |
| [license-onot.md](./license-onot.md) | GPL と onot (Apache-2.0) |
| [status.md](./status.md) | SPEC1.0.0-spec と実装の差分 |
| [decisions/](./decisions/) | D-006、D-007等 |

## 参照ユースケース `{@specs:s-h004}`

| ホスト | 流れ |
| --- | --- |
| Syft パイプライン (L1) | `sbom.spdx.json` + `onot.yaml` → `OSS_Notice_*.md` → Ack が `ACKNOWLEDGEMENTS.md` にコピー |
| WordPress プラグイン (L0) | `composer.lock` 等 → ネイティブ CLI → `ACKNOWLEDGEMENTS.md` |
| Node.js ホスト | `npm run` から `s2j-oss-notice` |
| [S2J Cozy Brew](https://github.com/stein2nd/s2j-cozy-brew) | 移行後: `pipeline.engine: "oss-notice"` で venv 任意化 |

## 進行管理 `{@specs:s-h005}`

| 種別 | 場所 |
| --- | --- |
| **公開正本** | `docs/` |
| 草案スナップショット | `docs_mod/SPEC.md` |
| 見出しタグ | `npm run docs:heading-tags` ([`scripts/apply-heading-tags.py`](../scripts/apply-heading-tags.py)) |

### 移行チェックリスト (2026-11-25完了、6/6) `{@specs:s-h006}`

* [x] A-1〜 A-8、D、E を正本に反映
* [x] D-006 / D-007を [decisions/](./decisions/) で採用
* [x] `docs/specs.md` 索引 + 分割
* [x] `docs_mod/SPEC.md` に移行記録
* [x] `scripts/apply-heading-tags.py` の `TARGETS` に `docs/*.md` を追加 ([`npm run docs:heading-tags`](../package.json))
* [x] 姉妹 [s2j-acknowledgements `pipeline.md`](https://github.com/stein2nd/s2j-acknowledgements/blob/main/docs/pipeline.md) を `pipeline.engine` で更新 (`Notice エンジン` 節、`oss-notice` 解決順、argv。[pipeline-integration.md](./pipeline-integration.md) と同期。GitHub `main` 反映は姉妹リポジトリの merge)

## 改訂履歴 `{@specs:s-h007}`

| 日付 | 版 | 内容 |
| --- | --- | --- |
| 2026-11-24 | 0.1 | `docs_mod/SPEC.md` 初稿 |
| 2026-11-25 | 0.2 | onot 置き換え、レビュー反映 (docs_mod) |
| 2026-11-25 | **1.0.0-spec** | `docs/` 分割正本化 |
| 2026-11-25 | 1.0.0-spec | [移行チェックリスト](#specs-s-h006) 6/6完了 (姉妹 `pipeline.engine` 追随) |
