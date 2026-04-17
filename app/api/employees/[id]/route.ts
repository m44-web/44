import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, shifts, gpsLogs, audioRecordings } from "@/lib/db/schema";
import { eq, desc, isNull, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id } = await params;

  const user = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .get();

  if (!user) {
    return NextResponse.json(
      { error: "従業員が見つかりません" },
      { status: 404 }
    );
  }

  const allShifts = db
    .select()
    .from(shifts)
    .where(eq(shifts.userId, id))
    .orderBy(desc(shifts.startedAt))
    .all();

  const activeShift = db
    .select()
    .from(shifts)
    .where(and(eq(shifts.userId, id), isNull(shifts.endedAt)))
    .get();

  // Compute total worked minutes from completed shifts
  let totalMs = 0;
  for (const s of allShifts) {
    if (s.endedAt) {
      totalMs += s.endedAt.getTime() - s.startedAt.getTime();
    }
  }

  // Total recordings for this user
  const allRecordings = db
    .select()
    .from(audioRecordings)
    .where(eq(audioRecordings.userId, id))
    .all();

  // Total GPS points
  const gpsCount = db
    .select()
    .from(gpsLogs)
    .where(eq(gpsLogs.userId, id))
    .all().length;

  return NextResponse.json({
    user: { ...user, createdAt: user.createdAt.getTime() },
    shifts: allShifts.map((s) => ({
      id: s.id,
      startedAt: s.startedAt.getTime(),
      endedAt: s.endedAt?.getTime() ?? null,
      durationMs: s.endedAt
        ? s.endedAt.getTime() - s.startedAt.getTime()
        : Date.now() - s.startedAt.getTime(),
    })),
    stats: {
      totalShifts: allShifts.length,
      completedShifts: allShifts.filter((s) => s.endedAt).length,
      totalWorkedMs: totalMs,
      isOnShift: !!activeShift,
      currentShiftId: activeShift?.id ?? null,
      totalRecordings: allRecordings.length,
      totalGpsPoints: gpsCount,
    },
  });
}
