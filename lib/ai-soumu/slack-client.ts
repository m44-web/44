type PostMessageArgs = {
  channel: string;
  text: string;
  threadTs?: string;
};

export async function postSlackMessage({ channel, text, threadTs }: PostMessageArgs): Promise<void> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    console.log("[AI総務] SLACK_BOT_TOKEN not set; would have posted:", { channel, text });
    return;
  }

  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ channel, text, thread_ts: threadTs }),
  });

  if (!response.ok) {
    throw new Error(`Slack API error: ${response.status}`);
  }
  const data = (await response.json()) as { ok: boolean; error?: string };
  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error}`);
  }
}
