# S2J OSS Notice — CLI

正本。索引は [specs.md](./specs.md)。

## グローバル `{@cli:s-h001}`

| オプション | 説明 |
| --- | --- |
| `-h` / `--help` | ヘルプ |
| `-V` / `--version` | パッケージバージョン |

## サブコマンド `{@cli:s-h002}`

| コマンド | 説明 | 優先度 |
| --- | --- | --- |
| `help` | ヘルプ | 実装済 (スタブ) |
| `generate` | Notice 生成 | **P0 (L1)** |
| `init` | `onot.yaml` テンプレート (薄型、G2) | Ack `init` がフル正本 |
| `doctor` | スタンドアローン診断 (`engines.node`、bundled カタログ、任意 `-i`) | 実装済。**engine 確認は Ack `doctor` が正本** (G5 / ADR-004) |

## フォーマット表記 `{@cli:s-h003}`

| 層 | 正本 |
| --- | --- |
| CLI (onot 互換) | `md` / `html` / `text` / `pdf` (`-f md` は Ack 実装と同じ) |
| TypeScript API | `markdown` 等。**`markdown` は `md` のエイリアス** ([api.md](./api.md)) |

## onot 互換 `generate` (L1) `{@cli:s-h004}`

```bash
s2j-oss-notice generate \
  -i ./build/oss-notice/sbom.spdx.json \
  -f md \
  -o ./build/oss-notice/onot-notice \
  --config ./onot.yaml
```

| オプション | 必須 | 説明 |
| --- | --- | --- |
| `-i` / `--input` | yes | SBOM パス |
| `-f` / `--format` | no | デフォルト `md` |
| `-o` / `--output` | yes (L1) | **ディレクトリのみ** ([ADR-002](./decisions/002-output-flags.md)) |
| `--config` | no | `onot.yaml` (1.2.x `company:`) |
| `--online` | no | L3 |
| `--json` / `-q` | no | L2 (onot 同等) |

## S2J ネイティブ `generate` (L0) `{@cli:s-h005}`

`-o` ではなく **`--out-file`** で単一ファイルに書き込みます。

```bash
s2j-oss-notice generate \
  -i ./composer.lock \
  -f md \
  --out-file ./ACKNOWLEDGEMENTS.md
```

| オプション | 説明 |
| --- | --- |
| `-i` (反復可) | 単一 lock、または **複数 lock のマージ** |
| `--include-dev` | dev 依存を含める (デフォルト false) |
| `--resolve-license-text` | `## License texts` に bundled / `--online` 全文を付与 |

## `init` (薄型、G2) `{@cli:s-h006}`

```bash
s2j-oss-notice init
s2j-oss-notice init --force -o ./onot.yaml
```

`config/onot.yaml.example` をホストにコピーします。`ack.config.json` や venv は **作成しません** (`s2j-acknowledgements init --preset …`)。

## `doctor` (スタンドアローン、G5) `{@cli:s-h007}`

```bash
s2j-oss-notice doctor
s2j-oss-notice doctor -i ./sbom.spdx.json
```

| チェック | 内容 |
| --- | --- |
| Node.js | `>=22` (package `engines`) |
| bundled カタログ | `licenses.json` から MIT 等を参照可能 |
| `-i` / `--input` | 読み取り可能かつ `detectInputKind` が `unknown` でない |

exit `0` = すべて OK、`1` = いずれか FAIL。Syft / onot / Ack 設定は **検査しません** (姉妹 `doctor` が正本)。

## Exit code (L2以降 onot 整合) `{@cli:s-h008}`

**2は、用法エラーに使いません。** Ack は、子プロセス exit をそのまま伝播します。

| コード | 意味 |
| --- | --- |
| 0 | 成功 |
| 1 | その他の失敗 (**CLI 引数不足・用法エラーを含む**) |
| 2 | 入力の読み取り・パース失敗 |
| 3 | ライセンス解決失敗 |
| 4 | 設定不正 |
