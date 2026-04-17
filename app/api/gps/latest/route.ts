import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gpsLogs, users, shifts } from "@/lib/db/schema";
import { eq, isNull, desc, and, gte } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { evaluateActivity } from "@/lib/activity";

const LOOKBACK_MS = 15 * 60 * 1000; // 過去15分のGPSを取得

export async function GET() {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const activeShifts = db
    .select({
      shiftId: shifts.id,
      userId: shifts.userId,
      userName: users.name,
      startedAt: shifts.startedAt,
    })
    .from(shifts)
    .innerJoin(users, eq(shifts.userId, users.id))
    .where(isNull(shifts.endedAt))
    .all();

  const windowStart = new Date(Date.now() - LOOKBACK_MS);

  const locations = activeShifts.map((shift) => {
    // Latest GPS for display
    const latestGps = db
      .select()
      .from(gpsLogs)
      .where(
        and(eq(gpsLogs.shiftId, shift.shiftId), eq(gpsLogs.userId, shift.userId))
      )
      .orderBy(desc(gpsLogs.recordedAt))
      .limit(1)
      .get();

    // Recent window GPS for activity evaluation
    const recentGps = db
      .select()
      .from(gpsLogs)
      .where(
        and(
          eq(gpsLogs.shiftId, shift.shiftId),
          gte(gpsLogs.recordedAt, windowStart)
        )
      )
      .orderBy(desc(gpsLogs.recordedAt))
      .all();

    const activity = evaluateActivity(
      recentGps.map((p) => ({
        latitude: p.latitude,
        longitude: p.longitude,
        recordedAt: p.recordedAt.getTime(),
      }))
    );

    return {
      userId: shift.userId,
      userName: shift.userName,
      shiftId: shift.shiftId,
      startedAt: shift.startedAt.getTime(),
      gps: latestGps
        ? {
            latitude: latestGps.latitude,
            longitude: latestGps.longitude,
            accuracy: latestGps.accuracy,
            recordedAt: latestGps.recordedAt.getTime(),
          }
        : null,
      activity,
    };
  });

  return NextResponse.json({ locations });
}
