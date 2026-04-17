import type { AiSoumuTask, SlackMessageEvent } from "./types";
import { postSlackMessage } from "./slack-client";
import { askClaude } from "./claude-client";

export async function handleSlackEvent(event: SlackMessageEvent): Promise<void> {
  if (event.bot_id) return;

  const task = classifyTask(event.text);
  const reply = await runTask(task);

  await postSlackMessage({
    channel: event.channel,
    threadTs: event.thread_ts ?? event.ts,
    text: reply,
  });
}

export function classifyTask(text: string): AiSoumuTask {
  const normalized = text.replace(/<@[^>]+>/g, "").trim();

  if (/(議事録|ぎじろく|minutes)/i.test(normalized)) {
    return { kind: "minutes", rawText: normalized };
  }
  if (/(日報|週報|レポート|まとめ)/.test(normalized)) {
    return {
      kind: "report",
      period: /週/.test(normalized) ? "weekly" : "daily",
    };
  }
  if (normalized.endsWith("？") || normalized.endsWith("?") || /教えて|どうやって|どこ/.test(normalized)) {
    return { kind: "faq", question: normalized };
  }
  return { kind: "unknown", text: normalized };
}

const FAQ_SYSTEM_PROMPT = `あなたはAXEが提供する「AI総務」です。企業のSlackに常駐し、社員からの社内業務に関する質問に丁寧に回答します。

ルール:
- 回答は2〜4文で簡潔にまとめる
- 社内マニュアルに明確な答えがない場合は、「社内で確認が必要」と正直に伝える
- 敬語を使うが、堅すぎない自然な日本語で
- 人間の総務担当者のような温かみのある応対を心がける`;

async function runTask(task: AiSoumuTask): Promise<string> {
  switch (task.kind) {
    case "faq":
      return askClaude({
        system: FAQ_SYSTEM_PROMPT,
        messages: [{ role: "user", content: task.question }],
        maxTokens: 512,
      });
    case "minutes":
      return "議事録作成を承りました。音声ファイルまたはメモを添付してください。\n（MVP開発中：Week 5-6で実装予定）";
    case "report":
      return `${task.period === "weekly" ? "週次" : "日次"}レポートの集計を開始します。\n（MVP開発中：Week 7-8で実装予定）`;
    case "unknown":
      return "ご用件を理解できませんでした。『議事録を作って』『有給の申請方法は？』『今週の日報まとめて』などと話しかけてください。";
  }
}
