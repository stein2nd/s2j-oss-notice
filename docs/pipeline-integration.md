# S2J OSS Notice — Ack パイプライン統合

姉妹 [`@s2j/acknowledgements`](https://github.com/stein2nd/s2j-acknowledgements) との接続。**L1の完了定義** の一部。

## フロー `{@pipeline-integration:s-h001}`

```text
Syft (必須) → Feluda (任意) → Notice エンジン → 出力コピー
```

Notice エンジンは **`onot`** または **`oss-notice`** ([ADR-001](./decisions/001-pipeline-engine.md))。

## `ack.config.json` (想定) `{@pipeline-integration:s-h002}`

```json
{
  "pipeline": {
    "engine": "oss-notice",
    "onotConfig": "onot.yaml"
  }
}
```

| `engine` | 動作 |
| --- | --- |
| `onot` | `{venv}/bin/onot generate …` (現行) |
| `oss-notice` | `s2j-oss-notice generate …` (onot 互換 argv) |

移行期デフォルトはホスト側ポリシーです。S2J 最終形は **`oss-notice` をデフォルト** とします。

## コマンド形 (L1) `{@pipeline-integration:s-h003}`

Ack が起動する想定 (onot 実装と同型):

```text
s2j-oss-notice generate -i {workDir}/sbom.spdx.json -f md --config {onotConfigPath} -o {workDir}/onot-notice
```

出力: `{workDir}/onot-notice/OSS_Notice_….md` → ホスト `output` (例: `ACKNOWLEDGEMENTS.md`)。

## 実行ファイル解決 `{@pipeline-integration:s-h004}`

1. `node_modules/.bin/s2j-oss-notice`
2. `PATH` 上の `s2j-oss-notice`

**`doctor`:** engine の有無・解決は **Ack `doctor` が正本**。本パッケージの `doctor` はスタンドアローン用。

## 姉妹リポジトリへの追従 `{@pipeline-integration:s-h005}`

[s2j-acknowledgements `pipeline.md`](https://github.com/stein2nd/s2j-acknowledgements/blob/main/docs/pipeline.md) に **`pipeline.engine: "oss-notice"`** と実行ファイル解決を記載済み。実装は `src/application/notice-generate.ts` / `oss-notice.ts`。

E2E: 姉妹の `notice-engine.test.ts`、本リポジトリの `test/ack-engine-integration.test.ts` と `test/ack-pipeline-smoke.test.ts`。
