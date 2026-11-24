# ADR-005: npm リリースと L0単体製品化 (G4)

**状態:** 採用  
**日付:** 2026-11-25

## 決定 `{@005-npm-release-l0-standalone:s-h001}`

| npm 版 | 製品スコープ | 前提 |
| --- | --- | --- |
| **v1.0.0** | **L1** — SPDX JSON → `OSS_Notice_*.md`、Ack `pipeline.engine: "oss-notice"` で onot 差し替え | [specs.md](../specs.md) の v1完了定義 |
| **v2.0.0** | **L0単体** — lockfile 直通、`--out-file`、`ACKNOWLEDGEMENTS.md` 向け。**Syft / Ack 不要** | **v1.0.0公開後** に tag `v2.0.0` ([CHANGELOG.md](../../CHANGELOG.md)) |
| `0.0.x` | 開発中 (現行) | チェックリスト100% でも semver は手動 |

## L0単体ホスト (G4) `{@005-npm-release-l0-standalone:s-h002}`

| 含む | 含まない |
| --- | --- |
| `composer.lock` / `package-lock.json` / `pnpm-lock.yaml` / `yarn.lock` | `ack.config.json`、Syft、Feluda、venv + onot pip |
| 複数 lock マージ (`-i` 反復) | L1の `-o <dir>` + `OSS_Notice_*.md` 命名 (SBOM 経路は v1語彙) |
| `--resolve-license-text`、L2/L3フォーマット | Excel SBOM (G3) |

正本手順: [l0-standalone.md](../l0-standalone.md)。

## G4完了条件 `{@005-npm-release-l0-standalone:s-h003}`

| # | 項目 |
| --- | --- |
| 1 | [§L0](../status.md#status-l0) チェックリスト **100%** |
| 2 | [l0-standalone.md](../l0-standalone.md) (インストール / CLI / CI) |
| 3 | README の L0クイックスタート |
| 4 | `npm run test:doctor` の L0スモーク (**ONOT-DOC-008**) |
| 5 | v2.0.0向け [CHANGELOG.md](../../CHANGELOG.md) 節 (公開前ドラフト可) |

**ゲート完了:** 上記1〜5を満たし、[status.md](../status.md) の G4を ✅ とする。**npm に `2.0.0` を載せるタイミング** は v1.0.0tag のあと (semver 運用)。

## 理由 `{@005-npm-release-l0-standalone:s-h004}`

* L1 (onot 置き換え) と L0 (WordPress / 単一リポジトリ lock) は **購入者・導入ストーリーが異なる**。v2で L0を前面に出し、v1は Ack バックエンド向けに固定する。
* 実装は先行しても、**マーケ語彙と tag** は分離し、ホストが「SBOM だけ」「lock だけ」を選びやすくする。
