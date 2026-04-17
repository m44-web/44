import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shifts, users } from "@/lib/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const weeksParam = request.nextUrl.searchParams.get("weeks") ?? "4";
  const weeks = Math.min(Math.max(parseInt(weeksParam, 10) || 4, 1), 12);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = todayStart.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const thisMonday = new Date(todayStart.getTime() - mondayOffset * 86400000);
  const startDate = new Date(thisMonday.getTime() - (weeks - 1) * 7 * 86400000);

  const allEmployees = db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.role, "employee"))
    .all();

  const allShifts = db
    .select({
      userId: shifts.userId,
      startedAt: shifts.startedAt,
      endedAt: shifts.endedAt,
    })
    .from(shifts)
    .where(gte(shifts.startedAt, startDate))
    .all();

  const weeklyData: Array<{
    weekStart: string;
    weekEnd: string;
    employees: Array<{
      userId: string;
      userName: string;
      shifts: number;
      totalMs: number;
      daysWorked: number;
    }>;
    totalShifts: number;
    totalMs: number;
    uniqueWorkers: number;
  }> = [];

  for (let w = 0; w < weeks; w++) {
    const weekStart = new Date(thisMonday.getTime() - (weeks - 1 - w) * 7 * 86400000);
    const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);

    const weekShifts = allShifts.filter(
      (s) => s.startedAt >= weekStart && s.startedAt < weekEnd
    );

    const empMap = new Map<string, { shifts: number; totalMs: number; days: Set<string> }>();

    for (const s of weekShifts) {
      const existing = empMap.get(s.userId) ?? { shifts: 0, totalMs: 0, days: new Set<string>() };
      const endMs = s.endedAt?.getTime() ?? Date.now();
      existing.shifts++;
      existing.totalMs += endMs - s.startedAt.getTime();
      existing.days.add(s.startedAt.toISOString().slice(0, 10));
      empMap.set(s.userId, existing);
    }

    const employees = allEmployees
      .filter((e) => empMap.has(e.id))
      .map((e) => {
        const d = empMap.get(e.id)!;
        return {
          userId: e.id,
          userName: e.name,
          shifts: d.shifts,
          totalMs: d.totalMs,
          daysWorked: d.days.size,
        };
      })
      .sort((a, b) => b.totalMs - a.totalMs);

    weeklyData.push({
      weekStart: weekStart.toISOString().slice(0, 10),
      weekEnd: new Date(weekEnd.getTime() - 86400000).toISOString().slice(0, 10),
      employees,
      totalShifts: weekShifts.length,
      totalMs: employees.reduce((sum, e) => sum + e.totalMs, 0),
      uniqueWorkers: employees.length,
    });
  }

  return NextResponse.json({
    weeks: weeklyData,
    totalEmployees: allEmployees.length,
  });
}
