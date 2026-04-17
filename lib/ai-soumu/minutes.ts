import { askClaude } from "./claude-client";

export type MinutesInput = {
  transcript: string;
  participants?: string[];
};

export type Minutes = {
  title: string;
  decisions: string[];
  actions: Array<{ task: string; owner?: string; dueDate?: string }>;
  carryOver: string[];
  markdown: string;
};

const MINUTES_SYSTEM_PROMPT = `あなたはAI総務として、会議の文字起こしから構造化された議事録を作成します。

以下の形式のJSONで返してください（余計な文章は一切不要）:
{
  "title": "会議タイトル（文字起こしから推定）",
  "decisions": ["決定事項1", "決定事項2"],
  "actions": [
    {"task": "やること", "owner": "担当者（わかる場合）", "dueDate": "期限（わかる場合、YYYY-MM-DD形式）"}
  ],
  "carryOver": ["次回持ち越し事項1", "次回持ち越し事項2"]
}

情報が不足している場合は、そのフィールドを省略してください。`;

export async function generateMinutes(input: MinutesInput): Promise<Minutes> {
  const userMessage = [
    input.participants?.length
      ? `参加者: ${input.participants.join(", ")}`
      : undefined,
    "文字起こし:",
    input.transcript,
  ]
    .filter(Boolean)
    .join("\n\n");

  const response = await askClaude({
    system: MINUTES_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
    maxTokens: 2048,
  });

  const parsed = safeParseMinutes(response);
  const markdown = toMarkdown(parsed);

  return { ...parsed, markdown };
}

function safeParseMinutes(raw: string): Omit<Minutes, "markdown"> {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("no JSON");
    const data = JSON.parse(jsonMatch[0]);
    return {
      title: data.title ?? "議事録",
      decisions: Array.isArray(data.decisions) ? data.decisions : [],
      actions: Array.isArray(data.actions) ? data.actions : [],
      carryOver: Array.isArray(data.carryOver) ? data.carryOver : [],
    };
  } catch {
    return {
      title: "議事録（自動生成）",
      decisions: [],
      actions: [],
      carryOver: [raw],
    };
  }
}

function toMarkdown(m: Omit<Minutes, "markdown">): string {
  const lines: string[] = [`# ${m.title}`, ""];

  if (m.decisions.length) {
    lines.push("## 決定事項", "");
    m.decisions.forEach((d, i) => lines.push(`${i + 1}. ${d}`));
    lines.push("");
  }

  if (m.actions.length) {
    lines.push("## アクション", "");
    m.actions.forEach((a) => {
      const owner = a.owner ? `（${a.owner}）` : "";
      const due = a.dueDate ? ` — 期限: ${a.dueDate}` : "";
      lines.push(`- [ ] ${a.task}${owner}${due}`);
    });
    lines.push("");
  }

  if (m.carryOver.length) {
    lines.push("## 次回持ち越し", "");
    m.carryOver.forEach((c) => lines.push(`- ${c}`));
  }

  return lines.join("\n");
}
