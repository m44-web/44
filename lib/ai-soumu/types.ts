export type SlackUrlVerification = {
  type: "url_verification";
  challenge: string;
  token: string;
};

export type SlackMessageEvent = {
  type: "message" | "app_mention";
  channel: string;
  user: string;
  text: string;
  ts: string;
  thread_ts?: string;
  bot_id?: string;
};

export type SlackEventCallback = {
  type: "event_callback";
  team_id: string;
  event: SlackMessageEvent;
};

export type SlackEventPayload = SlackUrlVerification | SlackEventCallback;

export type AiSoumuTask =
  | { kind: "faq"; question: string }
  | { kind: "minutes"; audioUrl?: string; rawText?: string }
  | { kind: "report"; period: "daily" | "weekly" }
  | { kind: "unknown"; text: string };
