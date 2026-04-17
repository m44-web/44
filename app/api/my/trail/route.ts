import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shifts, gpsLogs } from "@/lib/db/schema";
import { eq, isNull, and, asc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const activeShift = db
    .select()
    .from(shifts)
    .where(and(eq(shifts.userId, session.userId), isNull(shifts.endedAt)))
    .get();

  if (!activeShift) {
    return NextResponse.json({ points: [] });
  }

  const points = db
    .select({
      lat: gpsLogs.latitude,
      lng: gpsLogs.longitude,
      at: gpsLogs.recordedAt,
    })
    .from(gpsLogs)
    .where(eq(gpsLogs.shiftId, activeShift.id))
    .orderBy(asc(gpsLogs.recordedAt))
    .all();

  return NextResponse.json({
    points: points.map((p) => ({
      lat: p.lat,
      lng: p.lng,
      at: p.at.getTime(),
    })),
  });
}
