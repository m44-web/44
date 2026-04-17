export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
  industry: string;
};

// 注：ベータリリース前のため、以下はAXE想定のユースケース・期待効果です。
// 実際の顧客の声はベータ採用企業からのインタビュー取得後に差し替えます。
export const testimonials: Testimonial[] = [
  {
    id: "1",
    quote:
      "月29,800円でこのリターンは破格。CTOとエンジニアが本業に戻れるようになる想定です。",
    author: "想定ユースケース",
    role: "ITスタートアップ（代表取締役）",
    industry: "IT・15名規模",
  },
  {
    id: "2",
    quote:
      "新人の質問対応で先輩の手が止まる問題を、AI総務1人で解決。夜間も休日も答えられる設計です。",
    author: "想定ユースケース",
    role: "町工場（工場長）",
    industry: "製造・30名規模",
  },
  {
    id: "3",
    quote:
      "問い合わせの60%をAIが一次対応する想定。少人数でも回る体制を目指せます。",
    author: "想定ユースケース",
    role: "EC運営（運営責任者）",
    industry: "小売・8名規模",
  },
];
