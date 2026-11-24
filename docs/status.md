# S2J OSS Notice — 実装状況

| 項目 | 内容 |
| --- | --- |
| 最終更新 | 2026-11-25 |
| 仕様版 (正本) | [specs.md](specs.md) → **1.0.0-spec** |
| npm パッケージ | `@s2j/oss-notice` **0.0.1** ([package.json](../package.json)) |
| onot 比較ピン | [test/onot-version.txt](../test/onot-version.txt) → **1.2.0** |

---

## 概要 `{@status:s-h001}`

本ドキュメントは **現時点の実装スナップショット** を一ヵ所で確認するための索引です。CLI 契約の全文やデータモデルの定義は持ちません。

## 目的 `{@status:s-h002}`

* 置き換えレベル (L0– L3) 別の完了度と、**今フォーカスすべき未了** を短時間で把握する。
* **100% 完了条件チェックリスト** で P0 / P1を `[x]` / `[ ]` として追跡する。
* 仕様書・コードを開く前の「どこまでできているか」の入口にする。

## 非目的 `{@status:s-h003}`

* onot 全機能の再実装 (Electron / sidecar UI は [domain.md](domain.md) の非目的)。
* Ack パイプライン本体のタスク管理 (姉妹 [`s2j-acknowledgements`](https://github.com/stein2nd/s2j-acknowledgements) の Backlog)。
* npm **v1.0.0** リリース手順の細目 ([CHANGELOG.md](../CHANGELOG.md) と tag を参照)。

## 正本との関係 `{@status:s-h004}`

| トピック | 正本 |
| --- | --- |
| 置き換えレベル L0– L3 | [onot-parity.md](onot-parity.md) |
| CLI / exit code | [cli.md](cli.md) |
| 優先度 P0– P2 | [priorities.md](priorities.md) |
| Ack `pipeline.engine` | [pipeline-integration.md](pipeline-integration.md) |
| アーキテクチャー・ライセンス全文方針 | [architecture.md](architecture.md) |
| API | [api.md](api.md) |

**運用:** マイルストーン完了やレベル到達のたびに本ファイルの **最終更新** と下表を更新し、細部は上記正本と同期する。

**完了条件列:** カテゴリーごとの100% 到達用チェックリスト。`[x]` = 満たし済み、`[ ]` = 未。実装％は当該§の `[x]` 数 ÷ 全項目数 ([§ゲート外](#status-gates) を除く)。

## 機能一覧 `{@status:s-features}`

| 機能名 | 実装済み/未実装 | 実装％ | 完了条件 (100%) |
| --- | --- | --- | --- |
| 仕様 (`docs/`) | 実装済み | 100 | [§仕様・ドキュメント](#status-spec-docs) (7/7) |
| **L1** Ack backend (P0) | 実装済み | 100 | [§L1](#status-l1) (9/9) |
| **L2** onot CLI 互換 (P1) | 実装済み | 100 | [§L2](#status-l2) (8/8) |
| **L3** 入出力パリティ (P2) | 実装済み | 100 | [§L3](#status-l3) (7/7) |
| **L0** lockfile 直通 (P1) | 実装済み | 100 | [§L0](#status-l0) (8/8) |
| TypeScript API | 実装済み | 100 | [§API](#status-api) (4/4) |
| テスト・ローカル品質 | 実装済み | 100 | [§品質](#status-quality) (7/7) |
| Ack パイプライン統合 | 実装済み | 100 | [§Ack 連携](#status-ack) (4/4) |
| CLI `doctor` (スタンドアローン) | 実装済み | 100 | [§doctor](#status-doctor) (1/1) |

**L1完了定義 (npm v1.0.0想定):** **L1チェックリストは100%**。**Ack 連携** は姉妹側で実装済み (姉妹リポジトリへのマージ PR のみ任意)。

**プロダクトゴール (L3):** チェックリスト **55項目中55項目** = **100%** (下記 [§100% チェックリスト](#status-s100) の機械集計。`npm run docs:status-checklist` / `test/status-checklist.test.ts` で検証)。

## 100% 完了条件チェックリスト `{@status:s100}`

[S2J CozyBrew `docs/status.md`](https://github.com/stein2nd/s2j-cozy-brew/blob/main/docs/status.md) 同型。ローカル検証は `npm test` / `npm run lint` / `npm run lint:docs` / `npm run build` を正本とする。

### 仕様・ドキュメント `{@status:s-status-spec-docs}`

* [x] [specs.md](specs.md) 索引 (1.0.0-spec)
* [x] [status.md](status.md) 実装状況の入口と本チェックリスト
* [x] `docs/` 分割正本 ([domain](domain.md) / [architecture](architecture.md) / [cli](cli.md) 等)
* [x] [decisions/](decisions/) ADR (pipeline / output / 正本)
* [x] [docs_mod/SPEC.md](../docs_mod/SPEC.md) 草案0.2凍結
* [x] GitHub 向け `npm run lint:docs` ([package.json](../package.json))
* [x] `scripts/apply-heading-tags.py` と `npm run docs:heading-tags` ([specs.md](specs.md) 移行チェックリスト、見出し追加時に実行)

### L1: Ack backend (P0) `{@status:s-status-l1}`

正本: [onot-parity.md](onot-parity.md)、[pipeline-integration.md](pipeline-integration.md)、[cli.md](cli.md)

* [x] SPDX JSON アダプタ (`src/adapters/spdx/`)
* [x] `onot.yaml` 読み取り (`company:` 等)
* [x] `generate -i sbom -f md -o <dir> --config onot.yaml`
* [x] `OSS_Notice_*.md` ファイル名 ([renderers/onot-markdown/](../src/renderers/onot-markdown/))
* [x] `onot-markdown` レンダラー + fixture テスト
* [x] SBOM 内 `hasExtractedLicensingInfos` の利用
* [x] オフライン license 全文 (onot `licenses.json` 同梱、`npm run licenses:sync`)
* [x] ゴールデン onot diff (`test/golden-slice.test.ts`、正規化比較、CI)
* [x] Ack パイプライン argv スモーク (`test/ack-pipeline-smoke.test.ts`)

### L2: onot CLI 互換 (P1) `{@status:s-status-l2}`

正本: [cli.md](cli.md)、[onot-parity.md](onot-parity.md)

* [x] 繰り返し `-f` / `--output-dir` (`-o`)
* [x] `-f html` / `-f text` (`txt`)
* [x] exit code0–4意味 ([cli.md](cli.md))
* [x] `--json` / `-q` / `warning:` / `wrote {path}`
* [x] `--strict` (終了コード3)
* [x] `--stdout` (テキスト単一形式)
* [x] 未知形式 exit2
* [x] 契約テスト (`src/compat/onot-cli.contract.test.ts`)

### L3: 入出力パリティ (P2) `{@status:s-status-l3}`

正本: [onot-parity.md](onot-parity.md)、[priorities.md](priorities.md)

* [x] CycloneDX **JSON** 入力
* [x] CycloneDX **XML** 入力 (XXE 安全、`src/adapters/cyclonedx/xml-guard.ts`)
* [x] `-f pdf` 出力 (複数ページ、Components/Licenses/フッター、`src/renderers/onot-pdf/`)
* [x] `--online` (spdx.org から license 全文取得)
* [x] SPDX 方言・入力拡張 (JSON/YAML/Tag-Value sniff、`load-spdx.ts`； RDF/XML は明示エラー)
* [x] onot 規模の bundled license カタログ (L1と共有)
* [x] PDF レイアウト onot 同等 (テキスト/HTML 同型セクション + Offer of Source / ページ番号)

### L0: lockfile 直通 (P1) `{@status:s-status-l0}`

正本: [cli.md](cli.md) ネイティブ `generate`、ADR-002

* [x] `composer.lock` アダプタ
* [x] `package-lock.json` アダプタ
* [x] `--out-file` (単一ファイル、`-o` 不可)
* [x] `--include-dev` (デフォルト false)
* [x] `acknowledgements-markdown` レンダラー
* [x] `pnpm-lock.yaml` / `yarn.lock` (`src/adapters/pnpm/` / `yarn/`)
* [x] `--resolve-license-text` (bundled カタログで全文、`--online` 可)
* [x] 複数 lock マージ (`-i` 反復、`load-lockfiles.ts`)

### TypeScript API `{@status:s-status-api}`

正本: [api.md](api.md)

* [x] `generateNotice()` (`src/index.ts`)
* [x] `warnings[]` / `written[]` / `product`
* [x] L1経路のプログラム利用 (vitest 経由)
* [x] API ドキュメントと L2/L3オプションの完全同期 (`offline` / `formats` / L0 `inputs` 等、[api.md](api.md))

### テスト・ローカル品質 `{@status:s-status-quality}`

* [x] Vitest 単体・統合 (`npm test`)
* [x] ESLint + typecheck (`npm run lint`)
* [x] Vite + `tsc` ビルド (`npm run build`)
* [x] `npm run lint:docs`
* [x] `npm run test:doctor` (`scripts/test-doctor.sh`、CI と同内容 + CLI スモーク)
* [x] GitHub Actions (test / lint / docs / build) (`.github/workflows/ci.yml`)
* [x] onot ゴールデン diff を CI で実行 (`npm test` 内)

### Ack パイプライン統合 `{@status:s-status-ack}`

正本: [decisions/001-pipeline-engine.md](decisions/001-pipeline-engine.md)、[pipeline-integration.md](pipeline-integration.md)

* [x] ADR-001 `engine: "oss-notice"`
* [x] 本リポジトリの統合仕様 ([pipeline-integration.md](pipeline-integration.md))
* [x] [`s2j-acknowledgements` `pipeline.md`](https://github.com/stein2nd/s2j-acknowledgements/blob/main/docs/pipeline.md) 更新 (`engine` 節・`oss-notice` コマンド形)
* [x] Ack 側 `pipeline.engine: "oss-notice"` 実装と E2E (`notice-generate.ts`、姉妹 `notice-engine.test.ts`)

### CLI `doctor` (スタンドアローン) `{@status:s-status-doctor}`

正本: [cli.md](cli.md) — Ack `doctor` が engine 確認の正本

* [x] `s2j-oss-notice doctor` (Node v22+、bundled カタログ、`-i` 形式判定、`src/bin/doctor.ts`)

## ゲート外・任意 `{@status:s-status-gates}`

**100% 分母外** (未完了でも L1スコープの優先順位は [priorities.md](priorities.md) の P0を維持)。

| # | 内容 | 備考 |
| --- | --- | --- |
| G1 | onot Electron / desktop UI | [onot-parity.md](onot-parity.md) 非対象 |
| G2 | `init` で `onot.yaml` 生成 | ✅ 薄型 `init` ([ADR-004](decisions/004-doctor-and-init-scope.md))、Ack `init` がフル正本 |
| G3 | Excel SBOM ingest | onot にあるが S2J ホスト典型外 |
| G4 | npm **v2.0.0** 以降の L0単体製品化 | ✅ [ADR-005](decisions/005-npm-release-l0-standalone.md)、[l0-standalone.md](l0-standalone.md) (tag は v1.0.0後) |
| G5 | 本 CLI `doctor` と Ack `doctor` の重複回避 | ✅ [ADR-004](decisions/004-doctor-and-init-scope.md)、`doctor` スコープ分離 |

**補足:** [§機能スナップショット](#status-s-h006) は運用目線の短文。機械集計は [§100% チェックリスト](#status-s100) を参照。

---

## 全体スナップショット (レベル別) `{@status:s-h005}`

[onot-parity.md](onot-parity.md) と同期 (2026-11-25時点)。

| レベル | 完了率 (チェックリスト) | ひと言 |
| --- | --- | --- |
| L1: Ack backend | 100% (9/9) | SPDX → `OSS_Notice_*.md`、ゴールデン diff、onot カタログ、Ack argv スモーク |
| L2: CLI | 100% (8/8) | argv / exit / 警告は onot 契約テスト済み |
| L3: 入出力 | 100% (7/7) | CDX XML、SPDX 方言、PDF 構造化完了 |
| L0: lockfile | 100% (8/8) | pnpm / yarn、ライセンス全文、複数 lock マージ |
| 姉妹 Ack | 100% (4/4) | `engine: "oss-notice"` 実装・ドキュメント・テスト |

**プロダクトゴール (L3全体):** チェックリスト **100%** ([§機能一覧](#status-s-features) 参照)

---

## 機能スナップショット `{@status:s-h006}`

| 領域 | 状態 | メモ |
| --- | --- | --- |
| SPDX JSON → Notice | ✅ | `slice.spdx.json` + ゴールデン diff |
| CycloneDX JSON | ✅ | `example.cdx.json` |
| CycloneDX XML | ✅ | XXE ガード + テスト |
| lockfile (Composer / npm / pnpm / yarn) | ✅ | L0、`--out-file`、マージ |
| `-f md` / `html` / `text` / `pdf` | ✅ | 複数ページ PDF、onot 構造 |
| `--online` (SPDX.org) | ✅ | bundled は MIT / Apache-2.0最小 |
| `--json` / `--strict` / `warning:` | ✅ | L2 |
| `generateNotice` API | ✅ | [api.md](api.md) と L0– L3同期 |
| onot ゴールデン diff | ✅ | `test/golden-slice.test.ts` |
| `pipeline.engine: "oss-notice"` | ✅ | 姉妹 `notice-generate.ts` |
| `doctor` | ✅ | スタンドアローン (`doctor` サブコマンド) |

---

## 進行中の focus (短期) `{@status:s-h007}`

優先は上から検討。[priorities.md](priorities.md) と [onot-parity.md](onot-parity.md) に追随。

| # | initiative | 状態 |
| --- | --- | --- |
| 1 | onot ゴールデン diff + CI | 完了 (Vitest / GitHub Actions) |
| 2 | `@s2j/acknowledgements` `engine: "oss-notice"` | 完了 (ローカル姉妹実装) |
| 3 | bundled license カタログ拡充 (L1P0) | 完了 (`licenses.json`) |
| 4 | CycloneDX XML | 完了 |
| 5 | `test:doctor` / GitHub Actions | 完了 (`npm run test:doctor`) |

---

## 直近までに完了したもの (参考) `{@status:s-h008}`

詳細は Git 履歴および [CHANGELOG.md](../CHANGELOG.md) を参照。

* **仕様1.0.0-spec** — `docs/` 正本分割、ADR-001–003
* **L1: 骨格** — SPDX アダプタ、`onot-markdown`、CLI `-o` / `--config`
* **L0: 拡張** — Composer / npm lock、`acknowledgements-markdown`
* **L2** — 複数 `-f`、`html` / `text`、exit code、契約テスト
* **L3 (第一段)** — CycloneDX JSON、`--online`、`-f pdf` 最小

---

## 関連リンク `{@status:s-h009}`

* [specs.md](specs.md) — 仕様書一覧
* [onot-parity.md](onot-parity.md) — 置き換えレベルと検証
* [pipeline-integration.md](pipeline-integration.md) — Ack 連携
* [README.md](../README.md) — クイックスタート
