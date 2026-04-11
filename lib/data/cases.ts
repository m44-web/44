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
  "製造",
  "金融",
  "小売",
  "医療",
  "不動産",
  "IT",
  "物流",
  "自治体",
] as const;

export const cases: CaseStudy[] = [
  {
    id: "1",
    title: "大手製造業 A社",
    industry: "製造",
    location: "従業員5,000名",
    summary:
      "生産ラインの品質検査にAI画像認識を導入。不良品検出を自動化し、検査精度と速度を大幅に改善。",
    effect: "不良品流出率が80%削減、検査工数を60%削減",
    thumbnail: "/images/cases/case-manufacturing.jpg",
  },
  {
    id: "2",
    title: "地方銀行 B行",
    industry: "金融",
    location: "総資産2兆円規模",
    summary:
      "融資審査プロセスにAIを導入。過去データの分析による与信スコアリングと書類の自動読取りを実現。",
    effect: "審査期間を5日から1日に短縮",
    thumbnail: "/images/cases/case-finance.jpg",
  },
  {
    id: "3",
    title: "ECサイト運営 C社",
    industry: "小売",
    location: "年商50億円",
    summary:
      "AIチャットボットによるカスタマーサポート自動化と、購買データ分析によるレコメンドエンジンを構築。",
    effect: "問い合わせ対応コスト50%削減、CVR1.8倍",
    thumbnail: "/images/cases/case-retail.jpg",
  },
  {
    id: "4",
    title: "総合病院 D病院",
    industry: "医療",
    location: "病床数400床",
    summary:
      "電子カルテと連携したAI文書生成で、紹介状・診断書の作成を自動化。医師の事務負担を大幅に軽減。",
    effect: "文書作成時間を70%短縮",
    thumbnail: "/images/cases/case-medical.jpg",
  },
  {
    id: "5",
    title: "不動産管理 E社",
    industry: "不動産",
    location: "管理戸数10,000戸",
    summary:
      "物件情報の自動生成と、AIエージェントによる入居者問い合わせの24時間自動対応を導入。",
    effect: "問い合わせ対応の85%を自動化",
    thumbnail: "/images/cases/case-realestate.jpg",
  },
  {
    id: "6",
    title: "SaaS企業 F社",
    industry: "IT",
    location: "従業員200名",
    summary:
      "社内ナレッジベースを活用したAIアシスタントを開発。営業・CSチームの情報検索と提案書作成を効率化。",
    effect: "提案書作成時間を3時間から30分に短縮",
    thumbnail: "/images/cases/case-it.jpg",
  },
  {
    id: "7",
    title: "物流大手 G社",
    industry: "物流",
    location: "拠点数50+",
    summary:
      "配送ルート最適化AIと需要予測モデルを導入。倉庫オペレーションと配送計画の効率化を実現。",
    effect: "配送コスト25%削減、配送時間15%短縮",
    thumbnail: "/images/cases/case-logistics.jpg",
  },
  {
    id: "8",
    title: "H市役所",
    industry: "自治体",
    location: "人口30万人",
    summary:
      "住民向けAIチャットボットと、内部業務のワークフロー自動化を導入。窓口業務と申請処理を効率化。",
    effect: "窓口待ち時間40%減、職員の定型業務50%削減",
    thumbnail: "/images/cases/case-government.jpg",
  },
];
