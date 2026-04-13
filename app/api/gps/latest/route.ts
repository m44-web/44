import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gpsLogs, users, shifts } from "@/lib/db/schema";
import { eq, isNull, desc, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  // Get all currently active employees (those with open shifts)
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

  // For each active shift, get the latest GPS log
  const locations = activeShifts.map((shift) => {
    const latestGps = db
      .select()
      .from(gpsLogs)
      .where(and(eq(gpsLogs.shiftId, shift.shiftId), eq(gpsLogs.userId, shift.userId)))
      .orderBy(desc(gpsLogs.recordedAt))
      .limit(1)
      .get();

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
    };
  });

  return NextResponse.json({ locations });
}
