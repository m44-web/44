# Slackアプリ作成手順（オーナー向け）

**作成日**: 2026-04-17
**所要時間**: 約15分
**必要なもの**: Slackワークスペース管理者権限

---

## 目的

AI総務をSlackに常駐させるために、Slackアプリを作成し、
Next.jsのAPI（`/api/slack/events`）と連携させる。

---

## ステップ1：Slackアプリを作成（5分）

1. https://api.slack.com/apps にアクセス
2. 右上の **「Create New App」** をクリック
3. **「From scratch」** を選択
4. 以下を入力：
   - App Name: `AI総務`
   - Pick a workspace: 自分のテスト用ワークスペースを選択
5. **「Create App」** をクリック

---

## ステップ2：ボットの権限を設定（3分）

左サイドメニューの **「OAuth & Permissions」** を開く。

**Bot Token Scopes** に以下を追加：
- `app_mentions:read` — @AI総務 宛のメンションを読む
- `chat:write` — メッセージを送信する
- `chat:write.public` — パブリックチャンネルに投稿
- `files:read` — 添付ファイル（音声ファイル）を読む
- `channels:history` — チャンネルの履歴を読む（日報集計用）
- `im:history` — DMの履歴を読む
- `im:write` — DMを送信する

---

## ステップ3：Event Subscriptions を設定（3分）

左サイドメニューの **「Event Subscriptions」** を開く。

1. **「Enable Events」** をON
2. **「Request URL」** に以下を入力：
   ```
   https://axe-ai.jp/api/slack/events
   ```
   - URLを入力するとSlackが疎通確認する。`Verified ✓` が出たらOK
3. **「Subscribe to bot events」** を開き、以下を追加：
   - `app_mention`
   - `message.channels`（チャンネル内の発言を受信）
   - `message.im`（DM受信）
4. **「Save Changes」** をクリック

---

## ステップ4：ワークスペースにインストール（2分）

左サイドメニューの **「Install App」** を開く。

1. **「Install to Workspace」** をクリック
2. 権限確認ページで **「許可する」**
3. **Bot User OAuth Token**（`xoxb-...` で始まる）をコピー。これが `SLACK_BOT_TOKEN`

---

## ステップ5：Signing Secretを取得（1分）

左サイドメニューの **「Basic Information」** を開く。

1. **App Credentials** セクションを探す
2. **Signing Secret** の **Show** をクリック
3. 表示された文字列をコピー。これが `SLACK_SIGNING_SECRET`

---

## ステップ6：Vercelに環境変数を設定（3分）

1. https://vercel.com にログイン
2. AXEのプロジェクトを開く
3. **Settings → Environment Variables** を開く
4. 以下3つを追加：

| Name | Value | Environment |
|------|-------|-------------|
| `SLACK_SIGNING_SECRET` | ステップ5で取得した値 | Production, Preview |
| `SLACK_BOT_TOKEN` | ステップ4で取得した値 | Production, Preview |
| `ANTHROPIC_API_KEY` | Anthropic Console から取得 | Production, Preview |

5. **「Save」** をクリック
6. Vercelを再デプロイ（Deployments → 最新を選んで Redeploy）

---

## ステップ7：疎通確認（1分）

1. Slackのワークスペースで適当なチャンネルを開く
2. `/invite @AI総務` でチャンネルに招待
3. `@AI総務 こんにちは` と送信
4. AI総務が返信すれば成功 🎉

---

## トラブルシューティング

### Request URL の Verification が失敗する

- VercelのデプロイURLが https://axe-ai.jp になっているか確認
- `/api/slack/events` ルートがビルドに含まれているか確認
- `SLACK_SIGNING_SECRET` が正しく設定されているか確認

### AI総務が返事しない

- ボットがチャンネルに招待されているか確認
- Vercelのログで `/api/slack/events` へのリクエストが届いているか確認
- `SLACK_BOT_TOKEN` が正しく設定されているか確認

### 回答内容が `（開発モード）...` になる

- `ANTHROPIC_API_KEY` が未設定、もしくは不正
- Anthropic Console で請求情報を登録済みか確認

---

## 完了後のオーナーへの依頼

セットアップ完了したら、心にSlackで `@AI総務 疎通確認` とお知らせください。
心が次のステップ（Supabaseセットアップ）の案内をします。
