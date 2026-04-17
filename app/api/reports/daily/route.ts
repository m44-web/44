import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shifts, users, gpsLogs, audioRecordings } from "@/lib/db/schema";
import { eq, and, gte, lt, isNotNull } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const dateParam = request.nextUrl.searchParams.get("date");
  const target = dateParam ? new Date(dateParam + "T00:00:00") : new Date();
  const dayStart = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const dayShifts = db
    .select({
      shiftId: shifts.id,
      userId: shifts.userId,
      userName: users.name,
      userEmail: users.email,
      startedAt: shifts.startedAt,
      endedAt: shifts.endedAt,
    })
    .from(shifts)
    .innerJoin(users, eq(shifts.userId, users.id))
    .where(and(gte(shifts.startedAt, dayStart), lt(shifts.startedAt, dayEnd)))
    .all();

  const employeeSummaries = new Map<
    string,
    {
      userId: string;
      userName: string;
      userEmail: string;
      shifts: number;
      totalMs: number;
      gpsPoints: number;
      recordings: number;
      firstStart: number;
      lastEnd: number | null;
    }
  >();

  for (const s of dayShifts) {
    const existing = employeeSummaries.get(s.userId);
    const endMs = s.endedAt?.getTime() ?? Date.now();
    const durationMs = endMs - s.startedAt.getTime();

    const gpsCount = db
      .select({ id: gpsLogs.id })
      .from(gpsLogs)
      .where(eq(gpsLogs.shiftId, s.shiftId))
      .all().length;

    const audioCount = db
      .select({ id: audioRecordings.id })
      .from(audioRecordings)
      .where(eq(audioRecordings.shiftId, s.shiftId))
      .all().length;

    if (existing) {
      existing.shifts++;
      existing.totalMs += durationMs;
      existing.gpsPoints += gpsCount;
      existing.recordings += audioCount;
      if (s.startedAt.getTime() < existing.firstStart) {
        existing.firstStart = s.startedAt.getTime();
      }
      if (s.endedAt && (!existing.lastEnd || s.endedAt.getTime() > existing.lastEnd)) {
        existing.lastEnd = s.endedAt.getTime();
      }
    } else {
      employeeSummaries.set(s.userId, {
        userId: s.userId,
        userName: s.userName,
        userEmail: s.userEmail,
        shifts: 1,
        totalMs: durationMs,
        gpsPoints: gpsCount,
        recordings: audioCount,
        firstStart: s.startedAt.getTime(),
        lastEnd: s.endedAt?.getTime() ?? null,
      });
    }
  }

  const employees = Array.from(employeeSummaries.values()).sort(
    (a, b) => b.totalMs - a.totalMs
  );

  const completedShifts = dayShifts.filter((s) => s.endedAt);
  const totalWorkedMs = employees.reduce((sum, e) => sum + e.totalMs, 0);
  const uniqueWorkers = employees.length;

  const allEmployees = db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.role, "employee"))
    .all();
  const absentees = allEmployees.filter(
    (e) => !employeeSummaries.has(e.id)
  );

  return NextResponse.json({
    date: dayStart.toISOString().slice(0, 10),
    summary: {
      totalShifts: dayShifts.length,
      completedShifts: completedShifts.length,
      uniqueWorkers,
      totalEmployees: allEmployees.length,
      totalWorkedMs,
      absentees: absentees.map((a) => ({ id: a.id, name: a.name })),
    },
    employees,
  });
}
