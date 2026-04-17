# デプロイ前チェックリスト

**利用方法**: 本番環境にデプロイする前に、このリストを上から順に確認する。
1つでも ❌ があるなら、デプロイを中止する。

---

## 1. コード品質

- [ ] `npm run build` が成功する（TypeScriptエラー・ビルドエラーなし）
- [ ] ブランチが最新の main / メインブランチに追従している
- [ ] コンフリクトが解決されている
- [ ] 変更ファイル一覧を自分で目視確認した

## 2. 環境変数

- [ ] Vercelに必要な環境変数がすべて設定されている
  - [ ] `SLACK_SIGNING_SECRET`
  - [ ] `SLACK_BOT_TOKEN`
  - [ ] `ANTHROPIC_API_KEY`
  - [ ] `OPENAI_API_KEY`（議事録機能デプロイ時）
  - [ ] `SUPABASE_URL`（FAQ機能デプロイ時）
  - [ ] `SUPABASE_SERVICE_KEY`（FAQ機能デプロイ時）
- [ ] 環境変数の値がローカルの `.env.local` と一致している

## 3. 動作確認（ステージング環境）

- [ ] トップページが表示される
- [ ] `/about`, `/cases`, `/media`, `/contact`, `/privacy`, `/terms` が全ページ表示される
- [ ] モバイル表示が崩れていない
- [ ] `/api/health` が `{status: "ok"}` を返す
- [ ] お問い合わせフォームが送信できる（バリデーションも動く）

## 4. SEO・メタデータ

- [ ] `/sitemap.xml` が生成されている
- [ ] `/robots.txt` が生成されている
- [ ] OGP画像が表示される（Twitter Card Validator / Facebook Sharing Debugger でチェック）
- [ ] 各ページの `<title>` と `<meta description>` が適切

## 5. セキュリティ

- [ ] `.env.local` がコミットに含まれていない（`.gitignore` 効いているか確認）
- [ ] APIキーや秘密情報がソースコードにハードコーディングされていない
- [ ] Slack Events API の署名検証が有効化されている（`SLACK_SIGNING_SECRET` 設定済み）

## 6. AI総務 Slack ボット（該当時のみ）

- [ ] Slackアプリの Request URL が本番URLを指している
- [ ] Event Subscriptions の Verified チェックが通っている
- [ ] テストワークスペースで `@AI総務 こんにちは` に返答する
- [ ] Claude API キーの請求情報が登録済み（課金エラーで止まらないよう）

## 7. 予算管理

- [ ] 予算アラート（Claude APIの月次利用額）の通知先が心のDMに設定されている
- [ ] 自動停止ロジック（月次100%到達で停止）が動作確認済み

## 8. ドキュメント

- [ ] 変更内容が `company/operations/status.md` に反映されている
- [ ] 重要な意思決定があれば `company/decisions/` に記録済み
- [ ] オーナーに変更内容が共有されている

---

## 緊急時の戻し方（ロールバック手順）

1. Vercelのダッシュボードで前回のデプロイを選択
2. **「Promote to Production」** をクリック
3. 10〜30秒で本番が前バージョンに戻る
4. 原因究明 → 修正 → 再デプロイ

---

## デプロイ後の確認

- [ ] 本番URLで全ページを再チェック
- [ ] お問い合わせフォームを実際に送信してみる
- [ ] AI総務のSlackボットに話しかけて応答を確認
- [ ] `/api/health` が200を返す
- [ ] エラーログ（Vercel Logs）に異常がない
