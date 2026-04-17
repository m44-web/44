import { askClaude } from "./claude-client";

export type DailyReport = {
  author: string;
  text: string;
  timestamp: string;
};

export type ReportSummary = {
  period: "daily" | "weekly";
  highlights: string[];
  concerns: string[];
  progress: string[];
  markdown: string;
};

const REPORT_SYSTEM_PROMPT = `あなたはAI総務として、メンバーの日報/週報を集計し、マネージャー向けのサマリを作成します。

以下の形式のJSONで返してください:
{
  "highlights": ["今日/今週の重要トピック"],
  "concerns": ["課題・懸念事項"],
  "progress": ["全体の進捗メモ"]
}

情報が不足している場合は、各フィールドを空配列にしてください。`;

export async function summarizeReports(
  reports: DailyReport[],
  period: "daily" | "weekly",
): Promise<ReportSummary> {
  if (reports.length === 0) {
    return {
      period,
      highlights: [],
      concerns: ["今日はまだ日報が投稿されていません"],
      progress: [],
      markdown: `# ${period === "weekly" ? "週次" : "日次"}レポート\n\n本日は日報の投稿がありませんでした。`,
    };
  }

  const body = reports
    .map((r) => `【${r.author}】${r.timestamp}\n${r.text}`)
    .join("\n\n---\n\n");

  const response = await askClaude({
    system: REPORT_SYSTEM_PROMPT,
    messages: [{ role: "user", content: body }],
    maxTokens: 1024,
  });

  const parsed = safeParseReport(response);
  const markdown = toMarkdown(parsed, period, reports.length);

  return { period, ...parsed, markdown };
}

function safeParseReport(raw: string): Omit<ReportSummary, "period" | "markdown"> {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("no JSON");
    const data = JSON.parse(jsonMatch[0]);
    return {
      highlights: Array.isArray(data.highlights) ? data.highlights : [],
      concerns: Array.isArray(data.concerns) ? data.concerns : [],
      progress: Array.isArray(data.progress) ? data.progress : [],
    };
  } catch {
    return { highlights: [], concerns: [], progress: [raw] };
  }
}

function toMarkdown(
  s: Omit<ReportSummary, "period" | "markdown">,
  period: "daily" | "weekly",
  count: number,
): string {
  const label = period === "weekly" ? "週次" : "日次";
  const lines = [`# ${label}レポート（${count}件集計）`, ""];

  if (s.highlights.length) {
    lines.push("## 🎯 ハイライト", "");
    s.highlights.forEach((h) => lines.push(`- ${h}`));
    lines.push("");
  }

  if (s.concerns.length) {
    lines.push("## ⚠️ 課題・懸念", "");
    s.concerns.forEach((c) => lines.push(`- ${c}`));
    lines.push("");
  }

  if (s.progress.length) {
    lines.push("## 📈 進捗", "");
    s.progress.forEach((p) => lines.push(`- ${p}`));
  }

  return lines.join("\n");
}
