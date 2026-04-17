# Claude Auto Improve

`claude-improve.yml` は CRM を自動で継続改善するワークフローです。

## セットアップ (初回のみ)

### 1. Anthropic APIキーを取得

https://console.anthropic.com/settings/keys で API キーを作成。

### 2. GitHubリポジトリにシークレットを登録

```
https://github.com/m44-web/44/settings/secrets/actions
```

**New repository secret** を押して：

- Name: `ANTHROPIC_API_KEY`
- Value: （取得したAPIキー）

### 3. 有効化の確認

```
https://github.com/m44-web/44/actions
```

`Claude Auto Improve CRM` ワークフローが表示されていればOK。

## 使い方

### 自動実行 (6時間おき)

日本時間 **9:00 / 15:00 / 21:00 / 3:00** に自動で1回ずつ改善が走ります。
変更は `main` に直接コミット → Netlify が自動デプロイ。

### 手動実行

Actions タブ → `Claude Auto Improve CRM` → `Run workflow`。
`prompt` 欄に具体的な指示を入れると、その内容で改善を走らせられます。

### @claude メンション (対話型)

Issue / PR のコメントで `@claude ここを直して` と書くと、Claudeが応答してPRを作成します。

## 停止・間隔変更

`claude-improve.yml` の `cron` 行を編集：

- 停止: `on.schedule` ブロックごと削除
- 3時間ごと: `cron: "0 */3 * * *"`
- 毎日1回 (日本時間 9:00): `cron: "0 0 * * *"`

## コスト目安

Claude Sonnet 使用で 1回あたり $0.05〜$0.30 程度 (変更規模による)。
6時間おきなら月 $7〜$40 程度。
