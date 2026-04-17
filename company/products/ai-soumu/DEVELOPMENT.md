# AI総務 開発メモ

## 現在の実装状況（2026-04-17）

### Week 1-2: 基盤構築（着手開始）

- [x] Slack Events API の受け口（`app/api/slack/events/route.ts`）
- [x] Slack署名検証（`lib/ai-soumu/verify.ts`）
- [x] タスク分類ロジック（`lib/ai-soumu/router.ts`）
- [x] Slack送信クライアント（`lib/ai-soumu/slack-client.ts`）
- [ ] 環境変数設計（SLACK_SIGNING_SECRET, SLACK_BOT_TOKEN, ANTHROPIC_API_KEY）
- [ ] Supabase プロジェクト作成
- [ ] Slackアプリ作成・接続確認（Hello返答まで）

### Week 3-4: FAQ応答

- [ ] Supabase Vector セットアップ
- [ ] PDF / Google Docs アップロード画面
- [ ] ドキュメントのベクトル化（埋め込み生成）
- [ ] Claude APIで質問→回答生成
- [ ] 根拠資料リンク付与

### Week 5-6: 議事録自動作成

- [ ] 音声ファイル受信（Slack file_shared event）
- [ ] Whisper APIで文字起こし
- [ ] Claude APIで構造化（参加者・決定事項・アクション）
- [ ] Notion / Markdown 出力

### Week 7-8: 日報集計 + 磨き込み

- [ ] Slackチャンネル投稿の集計
- [ ] 定時実行（Vercel Cron）
- [ ] 管理画面（プラン設定、使用量確認）
- [ ] 料金プラン切り替え

### Week 9-10: ベータリリース

- [ ] 5社限定トライアル開始
- [ ] AXE自身を1社目として運用（ドッグフーディング）
- [ ] フィードバック収集フォーム

---

## 必要な環境変数

```
SLACK_SIGNING_SECRET=...    # Slackアプリの署名シークレット
SLACK_BOT_TOKEN=...         # Slackボットトークン（xoxb-...）
ANTHROPIC_API_KEY=...       # Claude API キー
OPENAI_API_KEY=...          # Whisper API キー（議事録用）
SUPABASE_URL=...            # SupabaseプロジェクトURL
SUPABASE_SERVICE_KEY=...    # Supabase サービスロールキー
```

## 次のステップ

1. Slackアプリをcreate。Signing Secretとボットトークンを取得
2. Vercelに環境変数を設定
3. Slack Event SubscriptionのURLを `https://axe-ai.jp/api/slack/events` に設定
4. `@AI総務 こんにちは` で疎通確認

## コスト管理

1タスクあたりの想定API費用：
- FAQ回答: Claude API約3〜5円（短文）
- 議事録作成: Claude + Whisper 合計30〜100円（30分会議）
- 日報集計: Claude API約10〜20円

月1,000タスクのパート採用プラン（9,800円）では、平均20円/タスク × 1000 = 20,000円 → 赤字リスク有。
→ FAQ中心の想定。複雑タスクは正社員プランに誘導。
