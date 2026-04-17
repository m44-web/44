export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
  industry: string;
};

export const testimonials: Testimonial[] = [
  {
    id: "1",
    quote:
      "月29,800円でこのリターンは破格。CTOとエンジニアが本業に戻れるようになりました。",
    author: "田中様",
    role: "ITスタートアップ A社 代表取締役",
    industry: "IT・15名",
  },
  {
    id: "2",
    quote:
      "新人の質問対応で先輩の手が止まる問題が、AI総務1人で解決。夜間も休日も答えてくれる。",
    author: "鈴木様",
    role: "町工場 B社 工場長",
    industry: "製造・30名",
  },
  {
    id: "3",
    quote:
      "問い合わせの60%をAIが一次対応してくれるので、少人数でも回る体制になりました。",
    author: "佐藤様",
    role: "EC運営 C社 運営責任者",
    industry: "小売・8名",
  },
];
