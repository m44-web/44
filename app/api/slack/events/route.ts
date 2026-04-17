import { NextResponse } from "next/server";
import { verifySlackRequest } from "@/lib/ai-soumu/verify";
import { handleSlackEvent } from "@/lib/ai-soumu/router";
import type { SlackEventPayload } from "@/lib/ai-soumu/types";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const timestamp = request.headers.get("x-slack-request-timestamp") ?? "";
  const signature = request.headers.get("x-slack-signature") ?? "";

  const verified = verifySlackRequest({ rawBody, timestamp, signature });
  if (!verified) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as SlackEventPayload;

  if (payload.type === "url_verification") {
    return NextResponse.json({ challenge: payload.challenge });
  }

  if (payload.type === "event_callback" && payload.event) {
    handleSlackEvent(payload.event).catch((error) => {
      console.error("[AI総務] event handler failed", error);
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
