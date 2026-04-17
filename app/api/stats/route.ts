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

  // 7-day trend: worked hours per day, last 7 days (including today)
  const trend: Array<{ date: string; workedMs: number; shifts: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(new Date().setHours(0, 0, 0, 0) - i * 24 * 3600 * 1000);
    const dayEnd = new Date(dayStart.getTime() + 24 * 3600 * 1000);
    const dayShifts = weekShifts.filter(
      (s) => s.startedAt >= dayStart && s.startedAt < dayEnd
    );
    let ms = 0;
    for (const s of dayShifts) {
      const end = s.endedAt?.getTime() ?? now;
      ms += end - s.startedAt.getTime();
    }
    trend.push({
      date: dayStart.toISOString().slice(0, 10),
      workedMs: ms,
      shifts: dayShifts.length,
    });
  }

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
    trend,
  });
}
