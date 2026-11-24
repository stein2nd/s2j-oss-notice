# S2J OSS Notice

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0.en.html)
[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## Description

S2J OSS Notice は、SPDX / CycloneDX SBOM (onot 互換の **Ack backend**) または lockfile (**lockfile 直通**) から OSS Notice、謝辞を生成する TypeScript **Notice エンジン** です。[@s2j/acknowledgements](https://github.com/stein2nd/s2j-acknowledgements) の `pipeline.engine: "oss-notice"` で [onot](https://github.com/sktelecom/onot) の差し替え先として設計され、lockfile のみのホストでは Syft / Python なしでも動作します。

置き換えレベルの略称 (L0– L3) と名称の対応は [onot-parity.md](docs/onot-parity.md) を参照してください。

[S2J Acknowledgements](https://github.com/stein2nd/s2j-acknowledgements) と組み合わせると Syft → Feluda → Notice → `ACKNOWLEDGEMENTS.md`、単体では [lockfile 直通の利用](docs/l0-standalone.md) 向けです。

## Features

* **CLI**: `init` / `doctor` / `generate` (Ack backend は onot 型 argv、lockfile 直通は `--out-file`)
* **Ack backend**: SPDX JSON / CycloneDX → `OSS_Notice_*.md`、`onot.yaml`、bundled ライセンスカタログ (オフライン)
* **lockfile 直通**: `composer.lock`、npm / pnpm / yarn lock → `--out-file` で単一 Markdown、複数 lock マージ、`--resolve-license-text` 任意
* **onot CLI 互換** / **入出力パリティ**: 主要フラグ、`exit code`、HTML / Text / PDF、CycloneDX 方言 (`docs/onot-parity.md`)
* **Ack 連携**: `pipeline.engine: "oss-notice"` のコマンド形を [pipeline-integration.md](docs/pipeline-integration.md) で定義 (Syft / engine 診断は Ack `doctor` が正本)
* **API**: `generateNotice()` (`@s2j/oss-notice` エクスポート)
* **品質**: Vitest (onot ゴールデン diff)、`test:doctor` (ONOT-DOC-001…008)、ESLint + `tsc6`、docs は `@s2j/docs-linter`

## License

本プロジェクトは GPL v3.0以降ライセンスの下で提供されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## Support and Contact

サポート、機能リクエスト、またはバグ報告については、[GitHub Issues](https://github.com/stein2nd/s2j-oss-notice/issues) ページをご覧ください。

---

## Installation

### Requirements

* Node.js v22+
* **Ack backend**: SPDX または CycloneDX SBOM (多くは Ack + Syft 上流)、任意で `onot.yaml`
* **lockfile 直通**: lockfile のみ (Syft / Python venv 不要)
* ホスト OS: Node が動く環境 (CI は Linux / macOS を想定)

### npm

ホストプロジェクトで devDependency としてインストールします。

```zsh
npm install -D @s2j/oss-notice
```

## Usage

### Quick start

**lockfile 直通 (lockfile のみ):**

```zsh
npm install -D @s2j/oss-notice
npx s2j-oss-notice doctor
npx s2j-oss-notice generate \
  -i ./composer.lock \
  -f md \
  --out-file ./ACKNOWLEDGEMENTS.md
```

**Ack backend (SBOM、スタンドアローン例):**

```zsh
npx s2j-oss-notice init
npx s2j-oss-notice generate \
  -i ./sbom.spdx.json \
  -f md \
  -o ./build/oss-notice/onot-notice \
  --config ./onot.yaml
```

Syft パイプラインでは [@s2j/acknowledgements](https://github.com/stein2nd/s2j-acknowledgements) と `pipeline.engine: "oss-notice"` を推奨します。詳細は [l0-standalone.md](docs/l0-standalone.md)、[pipeline-integration.md](docs/pipeline-integration.md)。

### Host `package.json` scripts

```json
{
  "scripts": {
    "notice:doctor": "s2j-oss-notice doctor",
    "notice:acknowledgements": "s2j-oss-notice generate -i composer.lock -f md --out-file ACKNOWLEDGEMENTS.md"
  },
  "devDependencies": {
    "@s2j/oss-notice": "^1.0.0"
  }
}
```

### Integration with S2J Acknowledgements

| 層 | 役割 |
| --- | --- |
| `@s2j/acknowledgements` | Syft / Feluda / `ack.config.json`、成果物コピー |
| `@s2j/oss-notice` | Notice エンジン (`generate` 子プロセス) |

```json
{
  "pipeline": {
    "engine": "oss-notice",
    "onotConfig": "onot.yaml"
  }
}
```

姉妹 [pipeline.md](https://github.com/stein2nd/s2j-acknowledgements/blob/main/docs/pipeline.md) と [ADR-001](docs/decisions/001-pipeline-engine.md) を参照してください。

## CLI Reference

| コマンド | 説明 |
| --- | --- |
| `init` | 薄型: `onot.yaml` ひな型のみ (フルホストは Ack `init`) |
| `doctor` | スタンドアローン診断 (Node、bundled カタログ、任意 `-i`) |
| `generate` | Ack backend: `-o <dir>` + SBOM。lockfile 直通: `--out-file` + lockfile |
| `help` / `--version` | 使用法、バージョン |

正本: [docs/cli.md](docs/cli.md)。

## Documentation

| 文書 | 内容 |
| --- | --- |
| [docs/specs.md](docs/specs.md) | 仕様索引 (正本) |
| [docs/cli.md](docs/cli.md) | サブコマンド、exit code |
| [docs/api.md](docs/api.md) | TypeScript API |
| [docs/l0-standalone.md](docs/l0-standalone.md) | lockfile 直通の単体ホスト (G4) |
| [docs/pipeline-integration.md](docs/pipeline-integration.md) | Ack `pipeline.engine` |
| [docs/onot-parity.md](docs/onot-parity.md) | 置き換えレベル (Ack backend / onot CLI 互換 / 入出力パリティ / lockfile 直通) |
| [docs/status.md](docs/status.md) | 実装進捗、チェックリスト |
| [docs/architecture.md](docs/architecture.md) | パイプライン、データモデル |
| [docs/decisions/](docs/decisions/) | ADR |

## Testing

| 種別 | コマンド | 備考 |
| --- | --- | --- |
| ユニット・統合 | `npm test` | Vitest (SPDX ゴールデン、lockfile 直通、Ack スモーク) |
| Doctor フィクスチャ | `npm run test:doctor` | ONOT-DOC-001…008 |
| Lint | `npm run lint` | ESLint + `tsc6` |
| ドキュメント | `npm run lint:docs` | `@s2j/docs-linter` |

## Development

### Project Structure

* `src/` — CLI (`bin/`)、アダプタ、コア、レンダラー、API
* `config/` — `onot.yaml.example` (`init` 同梱)
* `test/` — fixtures、ゴールデン、Ack 連携読み取りテスト
* `scripts/` — `test-doctor.sh`、`apply-heading-tags.py`、license 同期
* `docs/` — 仕様 Markdown

### Setting Up Development Environment

1. リポジトリをクローンします。

   ```zsh
   git clone https://github.com/stein2nd/s2j-oss-notice.git
   cd s2j-oss-notice
   ```

2. 依存関係をインストールし、品質ゲートを実行します。

   ```zsh
   npm install
   npm run lint
   npm test
   npm run test:doctor
   ```

### Building and Testing

```zsh
npm run build          # Vite → dist/bin/cli.js + dist/index.js
npm run format:check   # Prettier
npm run lint:docs      # Markdown (@s2j/docs-linter)
npm run pack:check     # npm pack --dry-run
```

リリース語彙 (v1.0.0 = Ack backend、v2.0.0 = lockfile 直通単体): [CHANGELOG.md](CHANGELOG.md)、[ADR-005](docs/decisions/005-npm-release-l0-standalone.md)。

## Contributing

貢献をお待ちしています。以下の手順に従ってください。

1. リポジトリをフォークしてください。
2. 機能ブランチを作成してください (`git checkout -b feature/amazing-feature`)。
3. 変更をコミットしてください (`git commit -m 'Add some amazing feature'`)。
4. 機能ブランチにプッシュしてください (`git push origin feature/amazing-feature`)。
5. Pull Request を開いてください。

*詳細な仕様については、[docs/specs.md](docs/specs.md) を参照してください。*

### Development Guidelines

* コミット前に `npm run lint` / `npm test` / `npm run test:doctor` / `npm run format:check` / `npm run lint:docs` を推奨します。
* 仕様変更は `docs/` の正本と [decisions/](docs/decisions/) を更新し、必要なら `npm run docs:heading-tags` を実行してください。

## Contributors & Developers

**"S2J OSS Notice"** はオープンソース・ソフトウェアです。以下の皆様がこのツールに貢献しています。

* **開発者**: Koutarou ISHIKAWA

## Acknowledgments

* 互換・比較基準: [onot](https://github.com/sktelecom/onot)
* 第一統合先: [@s2j/acknowledgements](https://github.com/stein2nd/s2j-acknowledgements)
* CLI、ドキュメント構成の参考: [S2J Docs Linter](https://github.com/stein2nd/docs-linter)
* 表示連携: [S2J About Window](https://github.com/stein2nd/s2j-about-window)
