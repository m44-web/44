import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gpsLogs, shifts, users } from "@/lib/db/schema";
import { eq, isNull, and, asc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { simplifyTrail } from "@/lib/activity";

// Return all GPS points for all currently-active shifts.
// Used by the admin map to render a polyline trail per employee.
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const shiftId = request.nextUrl.searchParams.get("shiftId");

  if (shiftId) {
    const points = db
      .select()
      .from(gpsLogs)
      .where(eq(gpsLogs.shiftId, shiftId))
      .orderBy(asc(gpsLogs.recordedAt))
      .all();

    const rawPts = points.map((p) => ({
      lat: p.latitude,
      lng: p.longitude,
      at: p.recordedAt.getTime(),
    }));

    const simplified = simplifyTrail(rawPts);
    const simplifiedSet = new Set(simplified.map((p) => `${p.lat},${p.lng}`));
    const filteredPts = rawPts.filter((p) => simplifiedSet.has(`${p.lat},${p.lng}`));

    return NextResponse.json({
      trails: [{ shiftId, points: filteredPts }],
    });
  }

  // All active shifts
  const activeShifts = db
    .select({
      shiftId: shifts.id,
      userId: shifts.userId,
      userName: users.name,
    })
    .from(shifts)
    .innerJoin(users, eq(shifts.userId, users.id))
    .where(isNull(shifts.endedAt))
    .all();

  const trails = activeShifts.map((shift) => {
    const points = db
      .select()
      .from(gpsLogs)
      .where(
        and(eq(gpsLogs.shiftId, shift.shiftId), eq(gpsLogs.userId, shift.userId))
      )
      .orderBy(asc(gpsLogs.recordedAt))
      .all();

    const rawPts = points.map((p) => ({
      lat: p.latitude,
      lng: p.longitude,
      at: p.recordedAt.getTime(),
    }));

    const simplified = simplifyTrail(rawPts);
    const simplifiedSet = new Set(simplified.map((p) => `${p.lat},${p.lng}`));

    return {
      shiftId: shift.shiftId,
      userId: shift.userId,
      userName: shift.userName,
      points: rawPts.filter((p) => simplifiedSet.has(`${p.lat},${p.lng}`)),
    };
  });

  return NextResponse.json({ trails });
}
