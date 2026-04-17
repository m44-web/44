import crypto from "node:crypto";

type VerifyArgs = {
  rawBody: string;
  timestamp: string;
  signature: string;
};

export function verifySlackRequest({ rawBody, timestamp, signature }: VerifyArgs): boolean {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  if (!signingSecret) {
    console.warn("[AI総務] SLACK_SIGNING_SECRET is not set; skipping verification in dev");
    return process.env.NODE_ENV !== "production";
  }

  const fiveMinutes = 60 * 5;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(timestamp)) > fiveMinutes) {
    return false;
  }

  const base = `v0:${timestamp}:${rawBody}`;
  const hmac = crypto.createHmac("sha256", signingSecret);
  hmac.update(base);
  const expected = `v0=${hmac.digest("hex")}`;

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
