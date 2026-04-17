import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gpsLogs, geofences } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { gpsLogSchema } from "@/lib/validations";
import { emitEvent } from "@/lib/event-bus";
import { checkRateLimit } from "@/lib/rate-limit";

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

let cachedFences: Array<{ id: string; name: string; latitude: number; longitude: number; radiusM: number; type: string }> | null = null;
let fencesCachedAt = 0;

function getGeofences() {
  if (cachedFences && Date.now() - fencesCachedAt < 60_000) return cachedFences;
  cachedFences = db.select().from(geofences).all();
  fencesCachedAt = Date.now();
  return cachedFences;
}

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

    const fences = getGeofences();
    for (const fence of fences) {
      const dist = haversineM(latitude, longitude, fence.latitude, fence.longitude);
      const inside = dist <= fence.radiusM;
      if (fence.type === "forbidden" && inside) {
        emitEvent({
          type: "geofence_alert",
          userId: session.userId,
          userName: session.userName,
          message: `${fence.name}（禁止エリア）に進入しました`,
        });
      } else if (fence.type === "allowed" && !inside) {
        emitEvent({
          type: "geofence_alert",
          userId: session.userId,
          userName: session.userName,
          message: `${fence.name}（許可エリア）から離脱しました`,
        });
      }
    }

    return NextResponse.json({ ok: true, lowAccuracy: accuracy ? accuracy > 100 : false });
  } catch {
    return NextResponse.json(
      { error: "GPS送信に失敗しました" },
      { status: 500 }
    );
  }
}
