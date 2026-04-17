export type CaseStudy = {
  id: string;
  title: string;
  industry: string;
  location: string;
  summary: string;
  effect: string;
  thumbnail: string;
  // 詳細ページ用（任意）
  employeeCount?: string;
  aiRole?: string;
  before?: string[];
  after?: string[];
  workflow?: string[];
  testimonial?: { quote: string; author: string; role: string };
};

export const industries = [
  "すべて",
  "IT",
  "製造",
  "小売",
  "不動産",
  "士業",
  "医療",
  "飲食",
  "自治体",
] as const;

export const cases: CaseStudy[] = [
  {
    id: "1",
    title: "ITスタートアップ A社",
    industry: "IT",
    location: "従業員15名",
    employeeCount: "15名",
    aiRole: "AI総務（正社員採用プラン）",
    summary:
      "総務専任がいない15名のスタートアップにAI総務を導入。議事録作成・社内FAQ・日報集計をすべてSlackで自動化。",
    effect: "総務業務に費やしていた週10時間がゼロに",
    thumbnail: "/images/cases/case-it.jpg",
    before: [
      "経営者が毎週3時間、議事録作成",
      "CTOが月10時間、社員からの質問対応",
      "マネージャーが週2時間、日報集計",
    ],
    after: [
      "議事録は録音投稿で3分自動生成",
      "社員の質問はAI総務がSlackで即回答",
      "日報は18時に自動集計してDM",
    ],
    workflow: [
      "Slackワークスペースに@AI総務を招待",
      "社内ドキュメント（就業規則・マニュアル）をアップロード",
      "会議終了後、録音ファイルをSlackに投稿",
      "日報チャンネルは毎日18時に自動集計",
    ],
    testimonial: {
      quote: "CTOとエンジニアが本業に戻れるようになった。月29,800円でこのリターンは破格。",
      author: "代表取締役 田中様",
      role: "ITスタートアップA社",
    },
  },
  {
    id: "2",
    title: "町工場 B社",
    industry: "製造",
    location: "従業員30名",
    employeeCount: "30名",
    aiRole: "AI総務（パート採用プラン）",
    summary:
      "紙ベースだった社内マニュアルをAI総務に読み込ませ、SlackでいつでもFAQ対応。新人教育の負担が激減。",
    effect: "新人の質問対応時間を80%削減",
    thumbnail: "/images/cases/case-manufacturing.jpg",
    before: [
      "新人からの質問が先輩作業員の手を止める",
      "同じ質問に何度も答え続ける必要",
      "マニュアルは紙で見つけにくい",
    ],
    after: [
      "新人はSlackでAI総務にいつでも質問可能",
      "夜間・休日の質問もAI総務が即回答",
      "先輩は本来の作業に集中",
    ],
  },
  {
    id: "3",
    title: "EC運営 C社",
    industry: "小売",
    location: "従業員8名",
    employeeCount: "8名",
    aiRole: "AIカスタマーサポート + AI総務",
    summary:
      "AIカスタマーサポートが問い合わせの一次対応を自動化。よくある質問には即回答、複雑な案件だけ人間に引き継ぎ。",
    effect: "問い合わせ対応コスト60%削減、応答時間1/5に",
    thumbnail: "/images/cases/case-retail.jpg",
  },
  {
    id: "4",
    title: "不動産管理 D社",
    industry: "不動産",
    location: "管理戸数500戸",
    employeeCount: "12名",
    aiRole: "AIカスタマーサポート",
    summary:
      "入居者からの問い合わせにAIカスタマーサポートが24時間対応。修繕依頼の受付から業者手配まで自動化。",
    effect: "夜間・休日の問い合わせ対応率が0%→95%に",
    thumbnail: "/images/cases/case-realestate.jpg",
  },
  {
    id: "5",
    title: "税理士事務所 E事務所",
    industry: "士業",
    location: "スタッフ5名",
    employeeCount: "5名",
    aiRole: "AI経理アシスタント",
    summary:
      "AI経理アシスタントが請求書の読み取り・仕訳の下書きを自動化。繁忙期の残業が大幅に減少。",
    effect: "月次処理時間を50%短縮",
    thumbnail: "/images/cases/case-finance.jpg",
  },
  {
    id: "6",
    title: "クリニック F院",
    industry: "医療",
    location: "スタッフ12名",
    employeeCount: "12名",
    aiRole: "AI総務",
    summary:
      "AI総務が院内のシフト管理補助・会議議事録・備品発注リストの整理を担当。事務スタッフの負担を軽減。",
    effect: "事務作業時間を週8時間削減",
    thumbnail: "/images/cases/case-medical.jpg",
  },
  {
    id: "7",
    title: "飲食チェーン G社",
    industry: "飲食",
    location: "店舗数12",
    employeeCount: "本部10名 + 各店舗",
    aiRole: "AI総務（チーム採用プラン）",
    summary:
      "各店舗の日報をAI総務が自動集計。売上・客数・課題をサマリにして本部マネージャーに毎日報告。",
    effect: "本部の情報把握スピードが3日→当日に",
    thumbnail: "/images/cases/case-logistics.jpg",
  },
  {
    id: "8",
    title: "H市役所",
    industry: "自治体",
    location: "職員200名",
    employeeCount: "200名",
    aiRole: "AI総務（内部FAQ対応）",
    summary:
      "庁内の各種申請手続きFAQをAI総務が回答。職員からの内部問い合わせ対応を自動化し、窓口業務に集中。",
    effect: "内部問い合わせの70%をAIが即回答",
    thumbnail: "/images/cases/case-government.jpg",
  },
];

export function getCase(id: string): CaseStudy | undefined {
  return cases.find((c) => c.id === id);
}
