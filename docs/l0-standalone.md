# L0単体利用 (lockfile → Acknowledgements)

**正本 (G4 / npm v2.0.0スコープ):** [ADR-005](./decisions/005-npm-release-l0-standalone.md)  
**CLI 契約:** [cli.md](./cli.md) § S2J ネイティブ `generate`

Syft、`ack.config.json`、Python venv **なし** で、lockfile から謝辞 Markdown を生成します。

## いつ使うか `{@l0-standalone:s-h001}`

L1 (SPDX → `OSS_Notice_*.md`) は [pipeline-integration.md](./pipeline-integration.md) または `@s2j/acknowledgements` を参照 (npm **v1.0.0** 語彙)。

| ホスト例 | 入力 | 成果物 |
| --- | --- | --- |
| WordPress プラグイン | `composer.lock` | リポジトリ直下の `ACKNOWLEDGEMENTS.md` |
| Node ライブラリ | `package-lock.json` / `pnpm-lock.yaml` / `yarn.lock` | 同上 |
| モノレポ | 複数 lock (`-i` 反復) | マージ済み単一 Markdown |

## インストール `{@l0-standalone:s-h002}`

Node.js **22+** のみです。オプションで `s2j-oss-notice init` は `onot.yaml` ひな型のみ (L0では通常不要)。

```bash
npm i -D @s2j/oss-notice
npx s2j-oss-notice doctor
```

## 基本コマンド `{@l0-standalone:s-h003}`

```bash
npx s2j-oss-notice generate \
  -i ./composer.lock \
  -f md \
  --out-file ./ACKNOWLEDGEMENTS.md
```

| オプション | 用途 |
| --- | --- |
| `-i` (反復可) | 複数 lock のマージ |
| `--include-dev` | dev 依存を一覧に含める |
| `--resolve-license-text` | `## License texts` に bundled 全文 (`--online` で取得可) |
| `-f html` / `text` / `pdf` | L2/L3出力 (単一 `--out-file`) |

**注意:** L0では **`-o <dir>` は使わない** (L1 / onot 互換)。必ず `--out-file` ([ADR-002](./decisions/002-output-flags.md))。

## package.json スクリプト例 `{@l0-standalone:s-h004}`

v2.0.0公開前は `0.0.x` / `1.x` を pin し、公開後に `^2.0.0` に更新してください。

```json
{
  "scripts": {
    "acknowledgements": "s2j-oss-notice generate -i composer.lock -f md --out-file ACKNOWLEDGEMENTS.md"
  },
  "devDependencies": {
    "@s2j/oss-notice": "^2.0.0"
  }
}
```

## TypeScript API `{@l0-standalone:s-h005}`

lockfile 経路は `generateNotice()` の `inputs` (パス配列) で指定します。詳細は [api.md](./api.md)。

## CI `{@l0-standalone:s-h006}`

本リポジトリの品質ゲート: `ONOT-DOC-008` (`scripts/test-doctor.sh`)。

```bash
npm run build   # ホストが fork する場合のみ
npx s2j-oss-notice generate -i composer.lock -f md --out-file ACKNOWLEDGEMENTS.md
git diff --exit-code ACKNOWLEDGEMENTS.md   # 任意: ドリフト検出
```

## Ack パイプラインとの関係 `{@l0-standalone:s-h007}`

併用してもよいが、同一ファイルを両方で上書きしないよう、ホスト側でパスを分けます。

| 経路 | ツール |
| --- | --- |
| SBOM → Notice → コピー | `@s2j/acknowledgements` + `pipeline.engine: "oss-notice"` |
| lock → 単一 Markdown | **本ドキュメント (L0単体)** |
