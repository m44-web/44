import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gpsLogs } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { gpsLogSchema } from "@/lib/validations";
import { emitEvent } from "@/lib/event-bus";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  // 20 GPS posts per minute per user (expected: 2-4 under normal usage)
  const limit = checkRateLimit("gps", session.userId, 20, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "GPS送信の頻度が高すぎます" },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = gpsLogSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { shiftId, latitude, longitude, accuracy, at } = parsed.data;

    if (accuracy && accuracy > 500) {
      return NextResponse.json(
        { error: "GPS精度が低すぎます", accuracy },
        { status: 422 }
      );
    }

    db.insert(gpsLogs)
      .values({
        shiftId,
        userId: session.userId,
        latitude,
        longitude,
        accuracy: accuracy ?? null,
        recordedAt: at ? new Date(at) : new Date(),
      })
      .run();

    emitEvent({
      type: "gps_update",
      userId: session.userId,
      userName: session.userName,
      latitude,
      longitude,
    });

    return NextResponse.json({ ok: true, lowAccuracy: accuracy ? accuracy > 100 : false });
  } catch {
    return NextResponse.json(
      { error: "GPS送信に失敗しました" },
      { status: 500 }
    );
  }
}
