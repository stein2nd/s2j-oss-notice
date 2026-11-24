# S2J OSS Notice — ドメイン

## 用語 `{@domain:s-h001}`

| 用語 | 意味 |
| --- | --- |
| **OSS Notice** | onot 形式の生成物。例: `{workDir}/onot-notice/OSS_Notice_*.md` |
| **Acknowledgements** | ホストが配布、UI に載せる最終ファイル (デフォルト **`ACKNOWLEDGEMENTS.md`**) |
| 関係 | [`@s2j/acknowledgements`](https://github.com/stein2nd/s2j-acknowledgements) が OSS Notice を **加工せず** ホスト `output` にコピー ([姉妹 pipeline.md](https://github.com/stein2nd/s2j-acknowledgements/blob/main/docs/pipeline.md)) |
| **L1** | SPDX JSON → Notice (onot 互換)。**npm v1の完了定義** |
| **L0** | lockfile 直通。**onot 互換外** の短経路。**npm v2.0.0** 単体製品 ([l0-standalone.md](./l0-standalone.md)) |
| SBOM | 本ツール L1では主に **SPDX JSON** (Syft / Feluda 後) |

## 目的 `{@domain:s-h002}`

* **L1:** SPDX (および将来の SBOM) から OSS Notice を生成し、**onot `generate` 相当** を満たす。
* **L0:** lockfile から Acknowledgements 向け Markdown を生成 (拡張経路)。
* **CLI** と **TypeScript API** を提供 (WordPress、Node、CI)。
* **`@s2j/acknowledgements`** から **エンジン差し替え** ([pipeline-integration.md](./pipeline-integration.md))。

## 非目的 `{@domain:s-h003}`

* フルスコープの OSS コンプライアンス監査。
* onot **Electron UI** / **onot-sidecar** API の再実装。
* 自プロダクトの Application License 表示。
* **Syft / Feluda の同梱** (SBOM 生成は上流)。

## 関連プロダクト `{@domain:s-h004}`

**運用:** 移行期は venv + onot と並行。最終的に **`@s2j/oss-notice` をデフォルトエンジン** とし Python 依存を任意化。

| 製品 | 関係 |
| --- | --- |
| [onot](https://github.com/sktelecom/onot) | 互換・ゴールデン比較の基準 |
| `@s2j/acknowledgements` | **第一統合先** (`pipeline.engine: "oss-notice"`) |
| `@s2j/acknowledgements` `doctor` | **L1では engine 解決は姉妹側** が正本。本 CLI の `doctor` はスタンドアローン利用向け (P1) |

## ドメイン境界 `{@domain:s-h005}`

| 対象 | 本ツール |
| --- | --- |
| Third-Party 依存 (SBOM / lockfile) | **対象** |
| OSS Notice / Acknowledgements 文書 | **生成** |
| ライセンス全文 (方針は入力種別で分岐) | [architecture.md](./architecture.md) (入力種別で分岐) |
| Application License | **非対象** |
