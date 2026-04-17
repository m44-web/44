export type CaseStudy = {
  id: string;
  title: string;
  industry: string;
  location: string;
  summary: string;
  effect: string;
  thumbnail: string;
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
    summary:
      "総務専任がいない15名のスタートアップにAI総務を導入。議事録作成・社内FAQ・日報集計をすべてSlackで自動化。",
    effect: "総務業務に費やしていた週10時間がゼロに",
    thumbnail: "/images/cases/case-it.jpg",
  },
  {
    id: "2",
    title: "町工場 B社",
    industry: "製造",
    location: "従業員30名",
    summary:
      "紙ベースだった社内マニュアルをAI総務に読み込ませ、SlackでいつでもFAQ対応。新人教育の負担が激減。",
    effect: "新人の質問対応時間を80%削減",
    thumbnail: "/images/cases/case-manufacturing.jpg",
  },
  {
    id: "3",
    title: "EC運営 C社",
    industry: "小売",
    location: "従業員8名",
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
    summary:
      "庁内の各種申請手続きFAQをAI総務が回答。職員からの内部問い合わせ対応を自動化し、窓口業務に集中。",
    effect: "内部問い合わせの70%をAIが即回答",
    thumbnail: "/images/cases/case-government.jpg",
  },
];
