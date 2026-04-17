import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gpsLogs, geofences } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { gpsLogSchema } from "@/lib/validations";
import { emitEvent } from "@/lib/event-bus";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const batchSchema = z.array(gpsLogSchema).min(1).max(50);

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

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const limit = checkRateLimit("gps_batch", session.userId, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "GPS送信の頻度が高すぎます" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = batchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const entries = parsed.data;
    let inserted = 0;

    for (const entry of entries) {
      if (entry.accuracy && entry.accuracy > 500) continue;
      db.insert(gpsLogs)
        .values({
          shiftId: entry.shiftId,
          userId: session.userId,
          latitude: entry.latitude,
          longitude: entry.longitude,
          accuracy: entry.accuracy ?? null,
          recordedAt: entry.at ? new Date(entry.at) : new Date(),
        })
        .run();
      inserted++;
    }

    const last = entries[entries.length - 1];
    emitEvent({
      type: "gps_update",
      userId: session.userId,
      userName: session.userName,
      latitude: last.latitude,
      longitude: last.longitude,
    });

    const fences = db.select().from(geofences).all();
    for (const fence of fences) {
      const dist = haversineM(last.latitude, last.longitude, fence.latitude, fence.longitude);
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

    return NextResponse.json({ ok: true, inserted });
  } catch {
    return NextResponse.json({ error: "GPS送信に失敗しました" }, { status: 500 });
  }
}
