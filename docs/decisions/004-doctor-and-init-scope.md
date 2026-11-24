# ADR-004: `init` と `doctor` のスコープ (G2 / G5)

**状態:** 採用  
**日付:** 2026-11-25

## 決定 `{@004-doctor-and-init-scope:s-h001}`

| ゲート | 本パッケージ | 姉妹 `@s2j/acknowledgements` |
| --- | --- | --- |
| **G2** `onot.yaml` 生成 | **`init`**: `config/onot.yaml.example` をホストにコピーのみ | **`init` 正本**: preset、`ack.config.json`、venv、onot pip |
| **G5** `doctor` 重複回避 | **Notice エンジン単体**: Node、bundled カタログ、任意 `-i` | **パイプライン正本**: Syft、Feluda、`pipeline.engine`、Ack 設定 |

## `init` (G2) `{@004-doctor-and-init-scope:s-h002}`

```bash
s2j-oss-notice init              # writes ./onot.yaml if missing
s2j-oss-notice init --force      # overwrite
```

* 既存ファイルは **警告してスキップ** (`--force` で上書き)。
* **設けないもの:** `ack.config.json`、Python venv、`onot` pip インストール ([architecture.md](../architecture.md) 更新)。

## `doctor` (G5) `{@004-doctor-and-init-scope:s-h003}`

`ack.config.json` があるディレクトリでは、本 CLI `doctor` は **パイプライン診断しない** 旨を明示します。

| チェック | `s2j-oss-notice doctor` | `s2j-acknowledgements doctor` |
| --- | --- | --- |
| Node.js | はい | はい |
| bundled `licenses.json` | はい | いいえ |
| 任意 `-i` 形式 sniff | はい | いいえ |
| Syft / Feluda / venv / onot | **いいえ** | はい |
| `engine: oss-notice` バイナリ | **いいえ** | はい |

## 理由 `{@004-doctor-and-init-scope:s-h004}`

* スタンドアローン利用 (SBOM のみ、lockfile L0) と Ack オーケストレーションを同じ CLI に詰め込まない。
* G2は Ack `init` の下位互換ではなく、**onot.yaml だけ欲しい** ホスト向けの最小経路。
