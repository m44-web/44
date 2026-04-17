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
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
