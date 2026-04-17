import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shifts } from "@/lib/db/schema";
import { eq, gte, and, isNull, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const weekStart = new Date(Date.now() - 7 * 24 * 3600 * 1000);

  const activeShift = db
    .select()
    .from(shifts)
    .where(and(eq(shifts.userId, session.userId), isNull(shifts.endedAt)))
    .get();

  const todayShifts = db
    .select()
    .from(shifts)
    .where(
      and(eq(shifts.userId, session.userId), gte(shifts.startedAt, todayStart))
    )
    .orderBy(desc(shifts.startedAt))
    .all();

  const weekShifts = db
    .select()
    .from(shifts)
    .where(
      and(eq(shifts.userId, session.userId), gte(shifts.startedAt, weekStart))
    )
    .all();

  const sum = (rows: typeof weekShifts) =>
    rows.reduce((acc, s) => {
      const end = s.endedAt?.getTime() ?? Date.now();
      return acc + (end - s.startedAt.getTime());
    }, 0);

  const dailyBreakdown: Array<{ date: string; ms: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().slice(0, 10);
    const dayMs = weekShifts
      .filter((s) => s.startedAt.toISOString().slice(0, 10) === dateStr)
      .reduce((acc, s) => {
        const end = s.endedAt?.getTime() ?? Date.now();
        return acc + (end - s.startedAt.getTime());
      }, 0);
    dailyBreakdown.push({ date: dateStr, ms: dayMs });
  }

  return NextResponse.json({
    activeShift: activeShift
      ? {
          id: activeShift.id,
          startedAt: activeShift.startedAt.getTime(),
        }
      : null,
    todayShifts: todayShifts.map((s) => ({
      id: s.id,
      startedAt: s.startedAt.getTime(),
      endedAt: s.endedAt?.getTime() ?? null,
    })),
    todayWorkedMs: sum(todayShifts),
    weekWorkedMs: sum(weekShifts),
    weekShiftsCount: weekShifts.length,
    dailyBreakdown,
  });
}
