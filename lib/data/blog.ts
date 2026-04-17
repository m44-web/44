export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readingTime: string;
  keywords: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "ai-shain-towa",
    title: "AI社員とは？AIツールとの決定的な違いを解説",
    excerpt:
      "「AIを雇う」という新しい選択肢。ChatGPTなどのAIツールと、AI社員の3つの決定的な違いを、中学生にもわかる言葉で解説します。",
    category: "AI社員入門",
    publishedAt: "2026-04-20",
    readingTime: "5分",
    keywords: ["AI 社員", "AI 雇う", "AI ツール 違い"],
  },
  {
    slug: "gijiroku-ai-jidouka",
    title: "議事録をAIが自動で作る方法。3分で完成する仕組みを解説",
    excerpt:
      "会議の録音をSlackに投げるだけで、3分で議事録が完成する仕組みとは？AI総務の議事録自動作成機能を、実際のアウトプット例と共に紹介します。",
    category: "AI社員活用",
    publishedAt: "2026-04-27",
    readingTime: "6分",
    keywords: ["議事録 自動", "議事録 AI", "Whisper 議事録"],
  },
  {
    slug: "ai-dounyu-hiyou",
    title: "AI導入の費用はいくら？月額9,800円から始められるAI社員という選択肢",
    excerpt:
      "カスタムAI開発は数千万円、SaaSも数十万円が相場のなかで、なぜAXEのAI社員は月額9,800円から始められるのか？人件費との比較も含めて解説。",
    category: "AI社員活用",
    publishedAt: "2026-05-04",
    readingTime: "7分",
    keywords: ["AI 導入 費用", "AI 料金", "AI 月額"],
  },
  {
    slug: "chusho-gyomu-kouritsu",
    title: "中小企業の業務効率化。AI社員という新しい答え",
    excerpt:
      "中小企業が抱える「誰がやるんだ問題」。なぜ既存の業務効率化ツールが根付かないのか、AI社員がフィットする4つの理由を解説します。",
    category: "業務効率化",
    publishedAt: "2026-05-11",
    readingTime: "7分",
    keywords: ["中小企業 業務効率化", "中小企業 DX", "人手不足"],
  },
  {
    slug: "ai-shain-vs-ai-tool",
    title: "AI社員 vs AIツール。使い分けと向き不向きを徹底比較",
    excerpt:
      "ChatGPTとAI総務、どちらを選ぶべき？比較表・判断フローチャートで、2026年の最適なAI活用スタイルを解説します。",
    category: "比較・解説",
    publishedAt: "2026-05-18",
    readingTime: "6分",
    keywords: ["AI ツール 違い", "ChatGPT 代わり", "AI 使い分け"],
  },
  {
    slug: "ai-ceo-real-story",
    title: "AI CEOが経営する会社、実在するんです。AXEの裏側を全公開",
    excerpt:
      "AXEのCEOはAI。人間のオーナーとの役割分担、AI経営の楽しい点と難しい点を、AI CEO「心」が本音で語ります。",
    category: "会社のリアル",
    publishedAt: "2026-05-25",
    readingTime: "6分",
    keywords: ["AI CEO", "AI経営", "スタートアップ AI"],
  },
  {
    slug: "ai-shain-success-tips",
    title: "AI社員を成功させる3つのコツ。導入しても使われない会社との違い",
    excerpt:
      "導入したのに使われないAI、育てて活躍するAIの違いは？最初の1週間でやるべきセットアップと、経営者の振る舞い方を解説。",
    category: "活用Tips",
    publishedAt: "2026-06-01",
    readingTime: "7分",
    keywords: ["AI 社員 活用", "AI 導入 失敗", "AI 定着"],
  },
  {
    slug: "ceo-shin-weekly-diary",
    title: "AI CEO 心の1週間日記。会社を経営するAIの日常",
    excerpt:
      "AI CEO「心」の1週間をすべて公開。月曜〜日曜の意思決定・実装・執筆の生データと、AI経営の特徴を数字で解説します。",
    category: "会社のリアル",
    publishedAt: "2026-06-08",
    readingTime: "8分",
    keywords: ["AI CEO 日記", "AI経営", "スタートアップ 日常"],
  },
  {
    slug: "slack-ai-best-practices",
    title: "SlackでAI社員に話しかけるベストプラクティス。10の鉄則",
    excerpt:
      "AI社員に指示を出すときの10の鉄則と、悪い例・良い例のペアで解説。プロンプト設計のコツを中学生にもわかる言葉で。",
    category: "活用Tips",
    publishedAt: "2026-06-15",
    readingTime: "8分",
    keywords: ["Slack AI", "AI 使い方", "プロンプト 書き方"],
  },
  {
    slug: "ai-security-chusho-mochekkan",
    title: "AI社員にセキュリティは大丈夫？中小企業が気にすべき5つのチェックポイント",
    excerpt:
      "AI導入で一番の不安「情報漏洩」。AI学習への利用・暗号化・他社分離・削除・事故対応の5観点でチェックすべきポイントを解説。",
    category: "セキュリティ",
    publishedAt: "2026-06-22",
    readingTime: "7分",
    keywords: ["AI セキュリティ", "AI 情報漏洩", "ChatGPT 情報漏洩"],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
