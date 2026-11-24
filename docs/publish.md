# S2J OSS Notice — npm 公開手順

## 前提 `{@publish:s-h001}`

* `npm run test:doctor` が green
* [CHANGELOG.md](../CHANGELOG.md) にバージョン節がある
* `package.json` の `version` と Git tag (`v*`) が一致する

## GitHub と npm `{@publish:s-github-npm}`

| きっかけ | 結果 |
| --- | --- |
| tag push | [npm-publish workflow](../.github/workflows/npm-publish.yml) が実行可能 (`v*` で起動) |
| GitHub Release | Releases ページのみ (registry は変わらない) |
| `npm publish` / workflow 成功 | registry の `latest` が更新される |

初回はリポジトリ Secret に **`NPM_TOKEN`** (npm Automation または Granular publish 権限) を登録してください。[@s2j/acknowledgements](https://github.com/stein2nd/s2j-acknowledgements) と同じトークンを使えます。

## 手順 `{@publish:s-h002}`

```zsh
npm run pack:check
git tag v0.0.1   # 例: version と一致
git push origin main --tags
gh release create v0.0.1 --title "v0.0.1" --notes-file CHANGELOG-excerpt.md
```

公開:

* **CI:** Actions → **Publish to npm** → `workflow_dispatch` (tag 済みのコミット) または tag push
* **ローカル:** `npm publish --access public` (`publishConfig.access` 済み)

## 同梱物 `{@publish:s-h003}`

`package.json` の `files`:

* `dist/` (ビルド成果物、`prepare` で生成)
* `config/` (`onot.yaml.example`)
* `README.md`、`LICENSE`

`docs/` は tarball に含めません (正本は GitHub)。

## 初回公開で `404` / `401` のとき `{@publish:s-trouble}`

| 症状 | 対処 |
| --- | --- |
| `PUT … @s2j/oss-notice 404` | npm の `@s2j` 組織メンバーであること、`npm login` 済み (2FA)。GitHub `NPM_TOKEN` を **Automation** / publish 権限付き Granular Token に更新 |
| `401 Unauthorized` (ローカル `npm whoami`) | `~/.npmrc` のトークン失効。`npm login` 後、Actions Secret `NPM_TOKEN` を再設定 |
| `0.0.0-stage` のみ見える | [Staged publishing](https://docs.npmjs.com/staged-publishing/)。`npm stage list` → `npm stage approve <id>` |

公開確認:

```zsh
npm view @s2j/oss-notice version --prefer-online
```