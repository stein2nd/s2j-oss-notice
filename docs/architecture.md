# S2J OSS Notice — アーキテクチャー

## 設計方針 `{@architecture:s-h001}`

Clean Architecture の厳密なレイヤー分離は、採用しません。

| 原則 | 内容 |
| --- | --- |
| 依存の向き | Core が Composer / npm / SPDX パーサー実装に直接依存しない |
| 関心の分離 | Adapter → 正規化 → Core → Renderer |
| テスト容易性 | Core をネットワークなしでテスト |

## 入力とレベル `{@architecture:s-h002}`

* **L1の正規化の正入力は、SPDX Package 情報** (JSON)。Syft / Feluda 後の `sbom.spdx.json` が標準。
* **lockfile アダプタは、L0用**。L1の onot 互換要件は満たさない。
* L0でも内部では **単一コア** (`NoticeDocument`) に収束する。lockfile は SPDX 相当に変換するか、短経路で Core に渡す (ADR 後追い: SPDX フィールドマッピング)。

### `PackageRecord` と SPDX (後追い ADR) `{@architecture:s-packagerecord-spdx-adr}`

| `PackageRecord` | SPDX 概念 (目安) |
| --- | --- |
| `name` | `packages[].name` / external ref |
| `version` | `packages[].versionInfo` |
| `licenseSpdx` | `licenseDeclared` / `licenseConcluded` |

詳細マッピングは、実装フェーズの ADR とします。

## 処理パイプライン `{@architecture:s-h003}`

```text
Input Adapter
  L1: SPDX JSON (+ onot.yaml メタ)
  L0: composer.lock | package-lock.json | …
        │
        ▼
Normalized OSS Metadata (NoticeDocument 前段)
        │
        ▼
Notice Generator Core
        │
        ▼
Output Renderer (onot-markdown / html / text / …)
```

## データモデル `{@architecture:s-h004}`

### `PackageRecord` `{@architecture:s-packagerecord}`

依存コンポーネントごとにひとつの `PackageRecord` を割り当てます。

| フィールド | 必須 | 説明 |
| --- | --- | --- |
| `name` | yes | パッケージ名 |
| `version` | yes | 解決済みバージョン |
| `ecosystem` | yes | `composer` \| `npm` \| `spdx` 等 |
| `licenseSpdx` | no | SPDX License Identifier |
| `licenseText` | no | 配布用全文 |
| `copyright` | no | Copyright 表示行 |
| `homepage` / `repository` / `description` | no | 任意 |

### `NoticeDocument` `{@architecture:s-noticedocument}`

並び順: キー `(ecosystem, name, version)` で重複排除、`name` 昇順 (実装で固定)。

| フィールド | 説明 |
| --- | --- |
| `title` | OSS Notice 見出し (`OSS Notice for …`) |
| `generatedAt` | `ISO 8601` (UTC 推奨) |
| `packages` | 重複排除後 |
| `warnings` | 非致命 |

## ライセンス全文の扱い `{@architecture:s-license}`

入力種別で分けます。

ネットワーク取得 (`--online`) は L3とします。

| 入力 | 方針 | 優先度 |
| --- | --- | --- |
| **L1 (SPDX)** | onot 同等。**オフライン** で `src/license/data/licenses.json` (onot 由来、`npm run licenses:sync`)。欠落は **warnings** | P0 |
| **L0 (lockfile)** | 識別子中心。全文は **`--resolve-license-text`** 等で P1以降 | P1以降 |

## リポジトリ構成 `{@architecture:s-h005}`

```text
src/
├── bin/cli.ts
├── compat/onot-cli.ts      # argv 正規化 (L1)
├── core/
├── adapters/
│   ├── spdx/
│   ├── composer/
│   └── npm/
├── renderers/
│   └── onot-markdown/      # ゴールデン準拠 (L1)
├── types/
└── index.ts
test/
├── fixtures/
└── onot-version.txt        # 比較用 onot ピン (1.2.x)
```

## 実装ガイド `{@architecture:s-h006}`

1. **単一コア:** SPDX → `NoticeDocument` → 全レンダラー。lockfile 経路 (レベル L0) はアダプタで Core に合流。
2. **互換レイヤ:** `compat/onot-cli.ts` と `renderers/onot-markdown/` を、Ack backend 対応 (レベル L1) と同時に分離する。
3. **テスト:** upstream `slice_notice` 相当の fixture + 正規化 diff → パーサー単体 → Ack E2E (onot 併走)。
4. **onot ピン:** [test/onot-version.txt](../test/onot-version.txt) に Ack と同系のバージョンを記載。
5. **`init` サブコマンド:** 薄型のみ (`onot.yaml` テンプレートコピー)。**フルホスト** (preset / `ack.config.json` / venv) は Ack `init` が正本 ([decisions/004-doctor-and-init-scope.md](./decisions/004-doctor-and-init-scope.md))。
6. **warnings:** CLI は stderr (onot 同様)。API は `warnings[]` ([api.md](./api.md))。

## 技術スタック `{@architecture:s-h007}`

TypeScript v6、Node v22+、ESM、Vite + `tsc` 宣言、`Commander.js` (P0)、Zod、Vitest、ESLint、Prettier、`@s2j/docs-linter`。
