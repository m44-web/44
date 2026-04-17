const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

type ClaudeMessage = {
  role: "user" | "assistant";
  content: string;
};

type ClaudeResponse = {
  content: Array<{ type: string; text: string }>;
  stop_reason: string;
  usage: { input_tokens: number; output_tokens: number };
};

export type AskClaudeArgs = {
  system: string;
  messages: ClaudeMessage[];
  model?: string;
  maxTokens?: number;
};

export async function askClaude({
  system,
  messages,
  model = DEFAULT_MODEL,
  maxTokens = 1024,
}: AskClaudeArgs): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("[AI総務] ANTHROPIC_API_KEY not set; returning stub response");
    return stubResponse(messages);
  }

  const response = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error: ${response.status} ${errText}`);
  }

  const data = (await response.json()) as ClaudeResponse;
  const text = data.content.find((c) => c.type === "text")?.text ?? "";
  return text.trim();
}

function stubResponse(messages: ClaudeMessage[]): string {
  const lastUser = messages.filter((m) => m.role === "user").pop();
  return `（開発モード）ご質問「${lastUser?.content ?? ""}」を受信しました。本番環境ではClaude APIが回答します。`;
}
