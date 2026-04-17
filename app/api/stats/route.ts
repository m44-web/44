import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shifts, users, gpsLogs, audioRecordings } from "@/lib/db/schema";
import { eq, gte, isNull, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const now = Date.now();
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const weekStart = new Date(now - 7 * 24 * 3600 * 1000);

  const totalEmployees = db
    .select()
    .from(users)
    .where(eq(users.role, "employee"))
    .all().length;

  const activeNow = db
    .select()
    .from(shifts)
    .where(isNull(shifts.endedAt))
    .all().length;

  const todayShifts = db
    .select()
    .from(shifts)
    .where(gte(shifts.startedAt, todayStart))
    .all();

  const weekShifts = db
    .select()
    .from(shifts)
    .where(gte(shifts.startedAt, weekStart))
    .all();

  const computeHours = (rows: Array<{ startedAt: Date; endedAt: Date | null }>) => {
    let ms = 0;
    for (const r of rows) {
      const end = r.endedAt?.getTime() ?? now;
      ms += end - r.startedAt.getTime();
    }
    return ms;
  };

  const todayWorkedMs = computeHours(todayShifts);
  const weekWorkedMs = computeHours(weekShifts);

  const todayRecordings = db
    .select()
    .from(audioRecordings)
    .where(gte(audioRecordings.recordedAt, todayStart))
    .all().length;

  const todayGpsPoints = db
    .select()
    .from(gpsLogs)
    .where(gte(gpsLogs.recordedAt, todayStart))
    .all().length;

  // Unique active users this week
  const weekUniqueUsers = new Set(weekShifts.map((s) => s.userId)).size;

  return NextResponse.json({
    totalEmployees,
    activeNow,
    todayShifts: todayShifts.length,
    todayWorkedMs,
    todayRecordings,
    todayGpsPoints,
    weekShifts: weekShifts.length,
    weekWorkedMs,
    weekUniqueUsers,
  });
}
