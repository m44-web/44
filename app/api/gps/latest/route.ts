import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gpsLogs, users, shifts, geofences } from "@/lib/db/schema";
import { eq, isNull, desc, and, gte } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { evaluateActivity, haversineMeters } from "@/lib/activity";

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
  const fences = db.select().from(geofences).all();

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

    let geofenceStatus: {
      violation: boolean;
      matches: Array<{ id: string; name: string; type: string }>;
    } | null = null;

    if (latestGps && fences.length > 0) {
      const matches = fences
        .map((f) => ({
          id: f.id,
          name: f.name,
          type: f.type,
          distance: haversineMeters(
            f.latitude,
            f.longitude,
            latestGps.latitude,
            latestGps.longitude
          ),
          radius: f.radiusM,
        }))
        .filter((f) => f.distance <= f.radius);

      const allowedFences = fences.filter((f) => f.type === "allowed");
      const insideAnyAllowed = matches.some((m) => m.type === "allowed");
      const insideForbidden = matches.some((m) => m.type === "forbidden");

      const violation =
        insideForbidden ||
        (allowedFences.length > 0 && !insideAnyAllowed);

      geofenceStatus = {
        violation,
        matches: matches.map((m) => ({ id: m.id, name: m.name, type: m.type })),
      };
    }

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
      geofence: geofenceStatus,
    };
  });

  return NextResponse.json({ locations });
}
