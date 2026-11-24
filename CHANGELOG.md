# S2J OSS Notice — CHANGELOG

形式は [Keep a Changelog](https://keepachangelog.com/) に近付けます。公開版は [GitHub Releases](https://github.com/stein2nd/s2j-oss-notice/releases) と同期します。

## [Unreleased]

### Added

* G2: 薄型 CLI `init` — `config/onot.yaml.example` をホストにコピー (`--force` / `-o` / `--cwd`)
* G5: スタンドアローン CLI `doctor` — Node v22+、bundled カタログ、任意 `-i`、Ack 案内 ([ADR-004](docs/decisions/004-doctor-and-init-scope.md))
* G4: L0単体向け [l0-standalone.md](docs/l0-standalone.md)、[ADR-005](docs/decisions/005-npm-release-l0-standalone.md)
* ローカル品質ゲート `ONOT-DOC-006`〜`008` — `init` / doctor / lockfile `generate` スモーク
* `test/specs-migration-checklist.test.ts` — `specs.md` 移行チェックリスト6/6

### Fixed

* L0で `-f md` 指定時、format が二重になり `lockfile input supports markdown output only` となる不具合 (`src/bin/generate.ts`)

### Docs

* README: L1 / L0の二本立て、L0クイックスタート
* `specs.md` 移行チェックリスト6/6、姉妹 `pipeline.engine` 追随
* `package.json` の description、`apply-heading-tags` に ADR-004 / 005を追加

### Planned

* **v1.0.0** — `L1` Ack backend、SPDX → Notice、`pipeline.engine: "oss-notice"`
* **v2.0.0** — `L0` 単体の semver 前面化。v1.0.0公開後に tag

## [0.0.1] —2026-11-25

開発ベースライン。L0– L3、TypeScript API、`generate`、CI、`test:doctor` ONOT-DOC-001〜005、Ack 連携仕様・テスト。

[unreleased]: https://github.com/stein2nd/s2j-oss-notice/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/stein2nd/s2j-oss-notice/releases/tag/v0.0.1