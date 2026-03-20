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
  "飲食",
  "小売",
  "医療",
  "パチンコ",
  "不動産",
  "自治体",
  "商業施設",
] as const;

export const cases: CaseStudy[] = [
  {
    id: "1",
    title: "居酒屋チェーン A社",
    industry: "飲食",
    location: "札幌市中央区",
    summary:
      "店頭にデジタルサイネージを設置し、日替わりメニューやハッピーアワー情報をリアルタイムで配信。",
    effect: "来店客数が前年比120%に増加",
    thumbnail: "/images/cases/case-restaurant.jpg",
  },
  {
    id: "2",
    title: "ドラッグストア B社",
    industry: "小売",
    location: "旭川市",
    summary:
      "店内3箇所にサイネージを設置し、季節商品やセール情報をスケジュール配信。",
    effect: "対象商品の売上が35%アップ",
    thumbnail: "/images/cases/case-retail.jpg",
  },
  {
    id: "3",
    title: "C歯科クリニック",
    industry: "医療",
    location: "札幌市北区",
    summary:
      "待合室にサイネージを設置し、予防歯科の啓発コンテンツや診療案内を表示。",
    effect: "予防歯科の受診率が25%向上",
    thumbnail: "/images/cases/case-medical.jpg",
  },
  {
    id: "4",
    title: "パチンコホール D社",
    industry: "パチンコ",
    location: "帯広市",
    summary:
      "外壁と店内入口に大型LEDビジョンを設置。新台入替情報やイベント告知を動画で配信。",
    effect: "イベント日の集客数が40%増加",
    thumbnail: "/images/cases/case-pachinko.jpg",
  },
  {
    id: "5",
    title: "不動産会社 E社",
    industry: "不動産",
    location: "函館市",
    summary:
      "店頭ウィンドウにサイネージを設置し、物件情報をスライドショー形式で24時間表示。",
    effect: "店頭からの問い合わせが2倍に増加",
    thumbnail: "/images/cases/case-realestate.jpg",
  },
  {
    id: "6",
    title: "F市役所",
    industry: "自治体",
    location: "釧路市",
    summary:
      "市役所ロビーにサイネージを設置し、行政情報・防災情報・イベント情報を多言語で配信。",
    effect: "窓口での問い合わせが20%減少",
    thumbnail: "/images/cases/case-government.jpg",
  },
  {
    id: "7",
    title: "ショッピングモール G",
    industry: "商業施設",
    location: "札幌市白石区",
    summary:
      "館内フロアマップとテナント広告をインタラクティブサイネージで展開。",
    effect: "テナント広告収入が月額50万円増加",
    thumbnail: "/images/cases/case-mall.jpg",
  },
  {
    id: "8",
    title: "ラーメン店 H",
    industry: "飲食",
    location: "小樽市",
    summary:
      "店頭にコンパクトサイネージを設置。SNS連動で口コミやメニュー写真を自動表示。",
    effect: "観光客の来店比率が15%向上",
    thumbnail: "/images/cases/case-ramen.jpg",
  },
];
