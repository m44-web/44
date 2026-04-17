# AXE — AI社員SaaSカンパニー

> AIを、雇おう。

このリポジトリは、合同会社AXEの**会社そのもの**です。
コーポレートサイト（Next.js）と、会社運営の全ドキュメント（戦略・財務・プロダクト・マーケティング）を一元管理します。

会社のAI CEO「心」がこのリポジトリで意思決定・実務・報告を行い、オーナー（取締役）が最終承認を行う体制です。

---

## ディレクトリ構成

```
/
├── app/                    # Next.jsアプリ（コーポレートサイト）
├── components/             # UIコンポーネント
├── lib/                    # 共通ロジック
│   └── ai-soumu/           # AI総務プロダクトのサーバーサイド
├── company/                # 会社経営ドキュメント
│   ├── vision.md           # ビジョン・ミッション
│   ├── strategy/           # 事業計画・OKR
│   ├── finance/            # 財務ルール・月次レポート
│   ├── products/           # プロダクト設計・開発メモ
│   ├── marketing/          # マーケティング戦略・ブログ・SNS
│   ├── operations/         # ステータス・オペレーション手順
│   ├── meetings/           # オーナーとの会議記録
│   ├── decisions/          # 重要な意思決定記録
│   └── org/                # 組織体制
└── public/                 # 画像等のアセット
```

---

## 開発（ウェブサイト）

```bash
# 依存パッケージのインストール
npm install

# 開発サーバーを起動
npm run dev
# → http://localhost:3000

# 本番ビルド
npm run build

# 本番起動
npm start
```

---

## 環境変数

`.env.local` を作成して以下を設定してください。サンプルは `.env.example` を参照。

| 変数 | 用途 | 必須 |
|------|------|------|
| `SLACK_SIGNING_SECRET` | Slack Events API 署名検証 | AI総務利用時 |
| `SLACK_BOT_TOKEN` | Slack Web API トークン（xoxb-...） | AI総務利用時 |
| `ANTHROPIC_API_KEY` | Claude API キー | AI総務利用時 |
| `OPENAI_API_KEY` | Whisper API キー（議事録用） | 議事録機能利用時 |
| `SUPABASE_URL` | Supabase プロジェクトURL | FAQ機能利用時 |
| `SUPABASE_SERVICE_KEY` | Supabase サービスロールキー | FAQ機能利用時 |

詳しいSlackアプリのセットアップ手順は `company/operations/slack-app-setup.md` を参照。

---

## 主なページ

| パス | 内容 |
|------|------|
| `/` | トップページ（AI社員の訴求） |
| `/about` | AI社員とは（サービス紹介） |
| `/cases` | 導入事例（業種別フィルター） |
| `/media` | 料金プラン |
| `/contact` | お問い合わせ |
| `/privacy` | プライバシーポリシー |
| `/terms` | 利用規約 |
| `/api/slack/events` | Slack Events API 受け口 |
| `/api/health` | ヘルスチェック |

---

## 技術スタック

- **Next.js 16** / React 19 / TypeScript 5
- **Tailwind CSS 4** / Framer Motion 12
- **Zod** / React Hook Form（フォーム検証）
- **Anthropic Claude API**（AI応答）
- **Slack Web API**（AI総務の常駐）
- デプロイ：Vercel

---

## AI CEO「心」について

AXEのCEOはAIです。
事業計画を書き、プロダクト設計をし、日々の意思決定を行っています。
このリポジトリの `company/` ディレクトリは、心が自律的に管理する経営ドキュメントです。

重要な意思決定は `company/decisions/` に記録され、オーナーの承認を得てから実行されます。
